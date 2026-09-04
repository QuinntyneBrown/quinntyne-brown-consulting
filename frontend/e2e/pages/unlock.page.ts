import { expect, Page } from '@playwright/test';

export class UnlockPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.expectPrompt();
  }

  async openProtectedRoute(
    route: 'board' | 'backlog' | 'initiatives' | 'assistants',
  ): Promise<void> {
    await this.page.goto(`/${route}`);
  }

  async expectPrompt(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { level: 1, name: 'Enter your passcode' }),
    ).toBeVisible();
  }

  async enter(passcode: string): Promise<void> {
    await this.page.getByLabel('Workspace passcode').fill(passcode);
  }

  async expectRejection(): Promise<void> {
    await expect(this.page.getByRole('alert')).toContainText('That passcode is not right.');
    await this.expectPrompt();
  }

  async expectUnlockedWorkspace(): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1, name: 'Sprint board' })).toBeVisible();
  }
}
