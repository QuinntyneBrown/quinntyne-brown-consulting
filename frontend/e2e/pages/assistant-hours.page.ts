import { expect, Locator, Page } from '@playwright/test';

export interface HoursTotals {
  readonly hoursLogged: string;
  readonly hoursOnCompleted: string;
  readonly storiesWorkedOn: string;
  readonly storiesCompleted: string;
}

export interface LoggedEntry {
  readonly story: string;
  readonly workedOn: string;
  readonly hours: string;
  readonly note?: string;
}

export type HoursFilter = 'All' | 'Completed' | 'In flight';

/**
 * One assistant's logged hours. Every selector on the hours page lives here, so a specification
 * says what the reader is doing and this says where the page keeps it.
 */
export class AssistantHoursPage {
  constructor(private readonly page: Page) {}

  /** Reaches the page the way the workspace does: from the assistant's card in the directory. */
  async openFromDirectory(name: string): Promise<void> {
    await this.page
      .locator('.assistant-card')
      .filter({ hasText: name })
      .getByRole('button', { name: 'Hours', exact: true })
      .click();
    await expect(this.page.getByRole('heading', { level: 1, name })).toBeVisible();
  }

  async expectAssistant(name: string, role: string): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1, name })).toBeVisible();
    await expect(this.page.locator('qbc-page-header')).toContainText(role);
  }

  async expectTotals(totals: HoursTotals): Promise<void> {
    await this.expectTotal('Hours logged', totals.hoursLogged);
    await this.expectTotal('Hours on completed stories', totals.hoursOnCompleted);
    await this.expectTotal('Stories worked on', totals.storiesWorkedOn);
    await this.expectTotal('Stories completed', totals.storiesCompleted);
  }

  /** The share is stated in words beside the meter, not conveyed by the bar's width alone. */
  async expectCompletedShare(percentage: number): Promise<void> {
    await expect(this.page.locator('.share-caption')).toHaveText(
      `${percentage}% of logged hours are on work that is done`,
    );
    await expect(this.page.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      String(percentage),
    );
  }

  /** Hours on completed stories can never exceed the total, however the page is filtered. */
  async expectShareWithinTotal(): Promise<void> {
    const logged = await this.total('Hours logged');
    const completed = await this.total('Hours on completed stories');
    expect(hoursOf(completed)).toBeLessThanOrEqual(hoursOf(logged));
  }

  async expectStories(...titles: string[]): Promise<void> {
    await expect(this.page.locator('.hours-row strong')).toHaveText(titles);
  }

  async expectStoryHours(title: string, own: string, storyTotal: string): Promise<void> {
    const row = this.row(title);
    await expect(row.locator('.hours-cell qbc-count')).toHaveText(own);
    await expect(row.locator('.of-total')).toHaveText(`of ${storyTotal}`);
  }

  async expectStoryState(title: string, state: string): Promise<void> {
    await expect(this.row(title).locator('qbc-status-pill')).toHaveText(state);
  }

  async filterBy(filter: HoursFilter): Promise<void> {
    await this.page.getByRole('button', { name: filter, exact: true }).click();
  }

  /** The filter reports what it narrowed to, so the change is announced rather than only seen. */
  async expectResultCount(shown: number, total: number): Promise<void> {
    await expect(this.page.locator('.result-count')).toHaveText(`${shown} of ${total} stories`);
  }

  async expandStory(title: string): Promise<void> {
    const disclosure = this.row(title).getByRole('button', { name: /^Entries/ });
    await disclosure.click();
    await expect(this.row(title).getByRole('button', { name: /^Hide/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  }

  async expectEntries(title: string, ...entries: { date: string; hours: string; note: string }[]) {
    const rows = this.row(title).locator('.entry');
    await expect(rows).toHaveCount(entries.length);
    for (const [index, entry] of entries.entries()) {
      const row = rows.nth(index);
      await expect(row.locator('.entry-date')).toHaveText(entry.date);
      await expect(row.locator('qbc-count')).toHaveText(entry.hours);
      await expect(row.locator('.entry-note')).toHaveText(entry.note);
    }
  }

  async logHours(entry: LoggedEntry): Promise<void> {
    await this.page.getByRole('button', { name: 'Log hours', exact: true }).first().click();
    const dialog = this.page.getByRole('dialog', { name: 'Log hours' });
    await dialog.getByLabel('Story *').selectOption({ label: entry.story });
    await dialog.getByLabel('Date worked *').fill(entry.workedOn);
    await dialog.getByLabel('Hours *').fill(entry.hours);
    if (entry.note !== undefined) await dialog.getByLabel('Note').fill(entry.note);
    await dialog.getByRole('button', { name: 'Log hours', exact: true }).click();
    await expect(dialog).toBeHidden();
  }

  /** Half hours are ordinary. A number field that kept the browser default step would refuse them. */
  async expectHoursFieldAcceptsQuarters(): Promise<void> {
    await this.page.getByRole('button', { name: 'Log hours', exact: true }).first().click();
    const dialog = this.page.getByRole('dialog', { name: 'Log hours' });
    const hours = dialog.getByLabel('Hours *');
    await hours.fill('2.5');
    await expect(hours).toHaveJSProperty('validity.valid', true);
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  }

  /**
   * A refusal names the field, whichever boundary catches it: the form when a value is missing,
   * and the server when an amount the browser allows is more time than a day holds.
   */
  async expectEntryRejected(hours: string, message: string | RegExp): Promise<void> {
    await this.page.getByRole('button', { name: 'Log hours', exact: true }).first().click();
    const dialog = this.page.getByRole('dialog', { name: 'Log hours' });
    await dialog.getByLabel('Hours *').fill(hours);
    await dialog.getByRole('button', { name: 'Log hours', exact: true }).click();
    await expect(this.page.getByRole('alert').first()).toContainText(message);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  }

  async deleteEntry(title: string, hours: string): Promise<void> {
    await this.row(title)
      .locator('.entry')
      .filter({ hasText: hours })
      .getByRole('button', { name: 'Delete', exact: true })
      .click();
    const confirmation = this.page.getByRole('dialog', { name: new RegExp(`^Delete ${hours} on`) });
    await expect(confirmation).toContainText('permanently removed');
    await confirmation.getByRole('button', { name: 'Delete entry' }).click();
  }

  /** Nothing logged: the page says so and offers the first entry rather than an empty meter. */
  async expectEmptyState(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'No hours logged yet' })).toBeVisible();
    await expect(
      this.page.locator('qbc-empty-state').getByRole('button', { name: 'Log the first hours' }),
    ).toBeVisible();
    await expect(this.page.getByRole('progressbar')).toHaveCount(0);
    await expect(this.page.locator('.result-count')).toHaveCount(0);
  }

  async goBackToDirectory(): Promise<void> {
    await this.page.getByRole('link', { name: /All assistants/ }).click();
    await expect(this.page.getByRole('heading', { level: 1, name: 'Assistants' })).toBeVisible();
  }

  private row(title: string): Locator {
    return this.page.locator('.hours-row').filter({ hasText: title });
  }

  private async expectTotal(label: string, value: string): Promise<void> {
    await expect(this.tile(label).locator('.stat-value')).toHaveText(value);
  }

  private async total(label: string): Promise<string> {
    return (await this.tile(label).locator('.stat-value').textContent()) ?? '';
  }

  private tile(label: string): Locator {
    return this.page.locator('.totals qbc-card').filter({ hasText: label });
  }
}

function hoursOf(value: string): number {
  return Number(value.replace(' h', ''));
}
