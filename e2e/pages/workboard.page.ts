import { expect, Page } from '@playwright/test';

export type WorkspaceRoute = 'board' | 'backlog' | 'initiatives' | 'assistants';
export type NavigationItem = 'Board' | 'Backlog' | 'Initiatives' | 'Assistants';

const HEADINGS: Readonly<Record<NavigationItem, string>> = {
  Board: 'Sprint board',
  Backlog: 'Backlog',
  Initiatives: 'Initiatives',
  Assistants: 'Assistants',
};

/** A value planted in the browsing context, to prove a later view arrived without a reload. */
const SESSION_MARK = 'qbcSessionMark';

export class WorkboardPage {
  constructor(private readonly page: Page) {}

  async navigateTo(route: WorkspaceRoute): Promise<void> {
    await this.page.goto(`/${route}`);
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  async usePrimaryNavigation(name: NavigationItem): Promise<void> {
    await this.page.getByRole('link', { name, exact: true }).click();
    await expect(this.page.getByRole('heading', { level: 1, name: HEADINGS[name] })).toBeVisible();
  }

  /** Follows a navigation item without assuming where the workspace takes the reader. */
  async selectNavigation(name: NavigationItem): Promise<void> {
    await this.page.getByRole('link', { name, exact: true }).click();
  }

  async expectView(name: NavigationItem): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1, name: HEADINGS[name] })).toBeVisible();
  }

  async expectRoute(route: WorkspaceRoute): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/${route}$`));
  }

  /** The rail identifies the open area, so the reader can see where they are. */
  async expectSelectedNavigation(name: NavigationItem): Promise<void> {
    await expect(this.page.locator('qbc-nav-item a.active')).toHaveCount(1);
    await expect(this.page.locator('qbc-nav-item a.active')).toContainText(name);
  }

  /**
   * Records a value on the browsing context. A client-side route change keeps it; a full-page
   * load discards it, which is exactly the difference L2-001 asks the navigation to preserve.
   */
  async markBrowsingContext(): Promise<void> {
    await this.page.evaluate((key) => {
      (window as unknown as Record<string, unknown>)[key] = 'kept';
    }, SESSION_MARK);
  }

  async expectSameBrowsingContext(): Promise<void> {
    const mark = await this.page.evaluate(
      (key) => (window as unknown as Record<string, unknown>)[key],
      SESSION_MARK,
    );
    expect(mark, 'the view arrived through a full-page browser reload').toBe('kept');
  }

  async openNewStory(): Promise<void> {
    await this.page.getByRole('button', { name: /New story/ }).click();
    await expect(this.page.getByRole('dialog', { name: 'New story' })).toBeVisible();
  }

  async expectFeedback(text: string | RegExp): Promise<void> {
    await expect(this.feedback()).toContainText(text);
  }

  async expectBuildVersions(...labels: string[]): Promise<void> {
    const sidebar = this.page.locator('qbc-sidebar');
    for (const label of labels) await expect(sidebar).toContainText(label);
  }

  async expectNoBackendBuildVersion(): Promise<void> {
    await expect(this.page.locator('qbc-sidebar')).not.toContainText('Backend');
  }

  async expectNoErrorPresented(): Promise<void> {
    await expect(this.page.getByRole('alert')).toHaveCount(0);
  }

  /** Below the navigation breakpoint the rail is reachable only through the bar's menu button. */
  async expectCompactMenu(): Promise<void> {
    await expect(this.menuButton()).toBeVisible();
    await expect(
      this.page.getByRole('link', { name: 'Backlog', exact: true }),
    ).not.toBeInViewport();
  }

  async useCompactMenu(name: NavigationItem): Promise<void> {
    await this.menuButton().click();
    await expect(this.menuButton()).toHaveAttribute('aria-expanded', 'true');
    await this.usePrimaryNavigation(name);
  }

  /** A viewport with room shows the rail without asking for it. */
  async expectPersistentNavigation(): Promise<void> {
    for (const name of ['Board', 'Backlog', 'Initiatives', 'Assistants'] as const)
      await expect(this.page.getByRole('link', { name, exact: true })).toBeInViewport();
  }

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
   * The bar carries the breadcrumb and New story, and below the navigation breakpoint it is
   * also the only way back to the rail, so it stays at the top of the viewport as the page
   * scrolls under it rather than leaving with the content.
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

  async expectNoHorizontalOverflow(): Promise<void> {
    const overflow = await this.page
      .locator('html')
      .evaluate((element) => element.scrollWidth > element.clientWidth);
    expect(overflow).toBe(false);
  }

  /** Nothing the reader needs may sit outside the viewport's width. */
  async expectContentWithinViewport(): Promise<void> {
    const width = this.page.viewportSize()?.width ?? 0;
    const widest = await this.page.locator('#main-content').evaluate((main) => {
      let value = 0;
      const elements = Array.from(main.querySelectorAll('h1, h2, h3, button, a, input, select'));
      for (const element of elements) {
        const box = element.getBoundingClientRect();
        if (box.width > 0) value = Math.max(value, box.right);
      }
      return value;
    });
    expect(Math.round(widest), 'content is clipped by the viewport').toBeLessThanOrEqual(width);
  }

  private menuButton() {
    return this.page.getByRole('button', { name: 'Open navigation' });
  }

  private feedback() {
    return this.page.locator('.feedback');
  }
}
