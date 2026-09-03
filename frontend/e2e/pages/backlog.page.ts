import { expect, Page } from '@playwright/test';

export class BacklogPage {
  constructor(private readonly page: Page) {}

  async search(text: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Search backlog' }).fill(text);
  }

  async expectStory(title: string): Promise<void> {
    await expect(this.page.getByText(title, { exact: true })).toBeVisible();
  }

  async expectSprintAssignment(title: string, sprintName: string): Promise<void> {
    const assignment = this.story(title).getByRole('combobox', { name: 'Sprint assignment' });
    await expect(assignment.locator('option:checked')).toHaveText(sprintName);
  }

  async openStory(title: string): Promise<void> {
    await this.story(title).getByRole('button', { name: 'Open' }).click();
    const editor = this.page.getByRole('dialog').filter({ has: this.page.getByRole('button', { name: 'Save story' }) });
    await expect(editor).toBeVisible();
    await expect(editor.getByLabel('Title *')).toHaveValue(title);
  }

  async groomStory(title: string): Promise<void> {
    await this.story(title).getByRole('button', { name: 'Groom' }).click();
    await expect(this.story(title).locator('.pill')).toHaveText('ready');
  }

  async assignStory(title: string, sprintName: string): Promise<void> {
    await this.story(title).getByRole('combobox', { name: 'Sprint assignment' }).selectOption({ label: sprintName });
    await expect(this.page.getByText('Story assigned to sprint.')).toBeVisible();
  }

  async expectState(title: string, state: 'archived' | 'draft' | 'ready'): Promise<void> {
    await expect(this.story(title).locator('.pill')).toHaveText(state);
  }

  async reloadAndExpectStory(title: string): Promise<void> {
    await this.page.reload();
    await expect(this.page.getByRole('heading', { level: 1, name: 'Backlog' })).toBeVisible();
    await this.expectStory(title);
  }

  private story(title: string) {
    return this.page.locator('.data-row').filter({ hasText: title });
  }
}
