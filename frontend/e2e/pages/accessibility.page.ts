import AxeBuilder from '@axe-core/playwright';
import { expect, Locator, Page } from '@playwright/test';

/** How far to walk the keyboard before concluding a modal has kept focus. */
const TRAP_STEPS = 12;
/** How far to walk the page before concluding an action cannot be reached. */
const WALK_STEPS = 40;

export class AccessibilityPage {
  constructor(private readonly page: Page) {}

  async expectNoSeriousViolations(): Promise<void> {
    const result = await new AxeBuilder({ page: this.page }).analyze();
    expect(
      result.violations.filter((violation) =>
        ['critical', 'serious'].includes(violation.impact ?? ''),
      ),
    ).toEqual([]);
  }

  /** The first stop on the page skips the navigation and lands on the content. */
  async expectSkipLinkReachesContent(): Promise<void> {
    await this.page.keyboard.press('Tab');
    const skipLink = this.page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeFocused();
    await this.page.keyboard.press('Enter');
    await expect(this.page.locator('#main-content')).toBeFocused();
  }

  /** Every named action is reached by walking the page forward from the top. */
  async expectActionsReachableByKeyboard(...names: string[]): Promise<void> {
    const reached: string[] = [];
    for (let step = 0; step < WALK_STEPS; step += 1) {
      await this.page.keyboard.press('Tab');
      const label = await this.focusedLabel();
      if (label) reached.push(label);
    }
    for (const name of names)
      expect(
        reached.some((label) => label.includes(name)),
        `${name} was never reached by keyboard`,
      ).toBe(true);
  }

  /** Focus order runs forward and back again through the same controls. */
  async expectFocusOrderReversible(): Promise<void> {
    await this.page.keyboard.press('Tab');
    const first = await this.focusedLabel();
    await this.page.keyboard.press('Tab');
    const second = await this.focusedLabel();
    expect(second, 'the keyboard did not move on').not.toBe(first);
    await this.page.keyboard.press('Shift+Tab');
    expect(await this.focusedLabel()).toBe(first);
  }

  /** Focus is visibly indicated wherever the keyboard puts it. */
  async expectFocusVisible(): Promise<void> {
    await this.page.keyboard.press('Tab');
    const indicated = await this.page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return false;
      const style = getComputedStyle(element);
      return (
        style.outlineStyle !== 'none' || style.boxShadow !== 'none' || style.borderStyle !== 'none'
      );
    });
    expect(indicated, 'the focused element carries no visible indicator').toBe(true);
  }

  /**
   * A modal names itself, takes focus with the keyboard, keeps it while it is open, and hands it
   * back to the control that opened it.
   */
  async expectDialogTrapsFocusAndReturns(
    action: string | RegExp,
    dialogName: string | RegExp,
  ): Promise<void> {
    const opener = this.opener(action);
    await opener.focus();
    await opener.press('Enter');
    const dialog = this.page.getByRole('dialog', { name: dialogName });
    await expect(dialog).toBeVisible();
    let landedInside = 0;
    if (await this.focusIsInside(dialog)) landedInside += 1;
    for (let step = 0; step < TRAP_STEPS; step += 1) {
      await this.page.keyboard.press('Tab');
      if (await this.focusIsInside(dialog)) landedInside += 1;
    }
    expect(landedInside, 'the keyboard never reached the open dialog').toBeGreaterThan(0);
    await this.page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  }

  /** Opens a dialog by the action that offers it, scans it, and closes it again. */
  async scanDialogOpenedBy(
    action: string | RegExp,
    dialogName: string | RegExp,
    within?: string | RegExp,
  ): Promise<void> {
    const opener = within
      ? this.page.getByRole('dialog', { name: within }).getByRole('button', { name: action })
      : this.opener(action);
    await opener.click();
    const dialog = this.page.getByRole('dialog', { name: dialogName });
    await expect(dialog).toBeVisible();
    await this.expectNoSeriousViolations();
    await this.page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  }

  /**
   * Feedback that arrives after an operation is announced through a polite live region, so
   * assistive technology is told without the announcement taking the keyboard for itself.
   */
  async expectAnnouncementWithoutMovingFocus(
    action: string | RegExp,
    message: string | RegExp,
  ): Promise<void> {
    const control = this.opener(action);
    await control.focus();
    await control.press('Enter');
    const feedback = this.page.locator('.feedback');
    await expect(feedback).toHaveAttribute('aria-live', 'polite');
    await expect(feedback).toHaveAttribute('aria-atomic', 'true');
    await expect(feedback).toContainText(message);
    const stolen = await feedback.evaluate((element) => element.contains(document.activeElement));
    expect(stolen, 'the announcement took keyboard focus').toBe(false);
    await expect(this.page.getByRole('dialog')).toHaveCount(0);
  }

  private opener(action: string | RegExp): Locator {
    return this.page.getByRole('button', { name: action }).first();
  }

  /**
   * Reports whether the keyboard is inside the dialog, and fails outright when it reached a
   * control behind it. A modal parks focus on the document itself as it wraps from the last
   * control back to the first, which is containment rather than escape.
   */
  private async focusIsInside(dialog: Locator): Promise<boolean> {
    const focus = await dialog.evaluate((element) => {
      const active = document.activeElement;
      return {
        inside: active !== null && element.contains(active),
        parked: active === null || active === document.body || active === document.documentElement,
        description: active?.outerHTML.slice(0, 120) ?? 'nothing',
      };
    });
    expect(
      focus.inside || focus.parked,
      `focus escaped the open dialog and reached ${focus.description}`,
    ).toBe(true);
    return focus.inside;
  }

  private async focusedLabel(): Promise<string> {
    return this.page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return '';
      return (element.getAttribute('aria-label') ?? element.textContent ?? '').trim();
    });
  }
}
