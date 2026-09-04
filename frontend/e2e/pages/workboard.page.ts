import { expect, Page } from '@playwright/test';

export class WorkboardPage {
  constructor(private readonly page: Page) {}

  async navigateTo(route: 'board' | 'backlog' | 'initiatives' | 'assistants'): Promise<void> {
    await this.page.goto(`/${route}`);
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  async usePrimaryNavigation(
    name: 'Board' | 'Backlog' | 'Initiatives' | 'Assistants',
  ): Promise<void> {
    await this.page.getByRole('link', { name, exact: true }).click();
    await expect(
      this.page.getByRole('heading', { level: 1, name: name === 'Board' ? 'Sprint board' : name }),
    ).toBeVisible();
  }

  async openNewStory(): Promise<void> {
    await this.page.getByRole('button', { name: /New story/ }).click();
    await expect(this.page.getByRole('dialog', { name: 'New story' })).toBeVisible();
  }

  /**
   * A dialog sheet is centred inside a box the viewport sizes, so its actions have to
   * stay reachable on a phone rather than sitting under the browser chrome.
   */
  async expectDialogActionsWithinViewport(name: string | RegExp): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name });
    const height = this.page.viewportSize()?.height ?? 0;
    for (const action of ['Cancel', 'Save story']) {
      const box = await dialog.getByRole('button', { name: action, exact: true }).boundingBox();
      expect(box, `${action} has no layout box`).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    }
  }

  /**
   * The bar carries the breadcrumb and New story, and on a tablet it is also the only way
   * back to the navigation, so it stays at the top of the viewport as the page scrolls
   * under it rather than leaving with the content.
   */
  async expectTopbarPinnedWhileScrolling(): Promise<void> {
    const topbar = this.page.locator('qbc-topbar');
    await expect(topbar).toBeVisible();
    const scrolled = await this.page.evaluate(() => {
      window.scrollTo(0, 400);
      return window.scrollY;
    });
    expect(scrolled, 'the page is too short to prove the bar is pinned').toBeGreaterThan(0);
    await expect.poll(async () => (await topbar.boundingBox())?.y).toBe(0);
    await expect(this.page.getByRole('button', { name: /New story/ })).toBeInViewport();
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * The rail's footer names the build the workspace is served from, so an operator can tell
   * which code is deployed from any page without leaving the workspace.
   */
  async expectDeployedVersion(label: string): Promise<void> {
    await expect(this.page.locator('qbc-sidebar')).toContainText(label);
  }

  async expectNoHorizontalOverflow(): Promise<void> {
    const overflow = await this.page
      .locator('html')
      .evaluate((element) => element.scrollWidth > element.clientWidth);
    expect(overflow).toBe(false);
  }
}
