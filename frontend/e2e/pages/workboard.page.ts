import { expect, Page } from '@playwright/test';

export class WorkboardPage {
  constructor(private readonly page: Page) {}

  async navigateTo(route: 'board' | 'backlog' | 'initiatives' | 'assistants'): Promise<void> {
    await this.page.goto(`/${route}`);
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  async usePrimaryNavigation(name: 'Board' | 'Backlog' | 'Initiatives' | 'Assistants'): Promise<void> {
    await this.page.getByRole('link', { name, exact: true }).click();
    await expect(this.page.getByRole('heading', { level: 1, name: name === 'Board' ? 'Sprint board' : name })).toBeVisible();
  }

  async openNewStory(): Promise<void> {
    await this.page.getByRole('button', { name: /New story/ }).click();
    await expect(this.page.getByRole('dialog', { name: 'New story' })).toBeVisible();
  }

  async expectNoHorizontalOverflow(): Promise<void> {
    const overflow = await this.page.locator('html').evaluate(element => element.scrollWidth > element.clientWidth);
    expect(overflow).toBe(false);
  }
}
