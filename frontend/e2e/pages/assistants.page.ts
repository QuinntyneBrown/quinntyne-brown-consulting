import { expect, Page } from '@playwright/test';

export class AssistantsPage {
  constructor(private readonly page: Page) {}

  async createAssistant(name: string): Promise<void> {
    await this.page.getByRole('button', { name: /New assistant/ }).first().click();
    const dialog = this.page.getByRole('dialog', { name: 'New assistant' });
    await dialog.getByLabel('Full name *').fill(name);
    await dialog.getByLabel('Role *').fill('Acceptance delivery assistant');
    await dialog.getByLabel('Specialties').fill('Delivery, Quality');
    await dialog.getByLabel('Availability').selectOption('available');
    await dialog.getByRole('button', { name: 'Save assistant' }).click();
    await this.expectAssistant(name);
  }

  async expectAssistant(name: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name })).toBeVisible();
  }

  async expectGuardedDeletion(name: string, storyTitle: string): Promise<void> {
    const card = this.page.locator('.assistant-card').filter({ hasText: name });
    await card.getByRole('button', { name: 'Delete' }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Reassign work first' });
    await expect(dialog.getByText(storyTitle, { exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();
  }

  async expectSaveFailureFeedback(name: string): Promise<void> {
    await this.page.route('**/api/assistants', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 503,
          contentType: 'application/problem+json',
          body: JSON.stringify({ detail: 'Assistant storage is temporarily unavailable.' })
        });
      } else {
        await route.fallback();
      }
    });
    await this.page.getByRole('button', { name: /New assistant/ }).first().click();
    const dialog = this.page.getByRole('dialog', { name: 'New assistant' });
    await dialog.getByLabel('Full name *').fill(name);
    await dialog.getByLabel('Role *').fill('Temporary role');
    await dialog.getByRole('button', { name: 'Save assistant' }).click();
    await expect(this.page.getByRole('alert')).toContainText('Assistant storage is temporarily unavailable.');
    await expect(dialog).toBeVisible();
    await this.page.unroute('**/api/assistants');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  }
}
