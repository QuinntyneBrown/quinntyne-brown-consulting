import { expect, Page } from '@playwright/test';

export class StoryEditorPage {
  constructor(private readonly page: Page) {}

  async createStory(
    title: string,
    epicName: string,
    assistantName: string,
    taskTitle: string,
  ): Promise<void> {
    await this.page.getByRole('button', { name: /New story/ }).click();
    const dialog = this.page.getByRole('dialog', { name: 'New story' });
    await dialog.getByLabel('Title *').fill(title);
    await dialog.getByLabel('Epic *').selectOption({ label: epicName });
    await dialog.getByLabel('Owner').selectOption({ label: assistantName });
    await dialog
      .getByLabel('Description or user story')
      .fill('As a consultant, I want a verified delivery workflow so that work remains clear.');
    await dialog
      .getByLabel('Acceptance criteria')
      .fill('The workflow persists and can be completed.');
    await dialog.getByLabel('Story points').selectOption({ label: '3' });
    await dialog.getByRole('button', { name: /Add task/ }).click();
    await dialog.getByLabel('Task 1 title').fill(taskTitle);
    await dialog.getByLabel('Task 1 assignee').selectOption({ label: assistantName });
    await dialog.getByRole('button', { name: 'Save story' }).click();
    await expect(dialog).toBeHidden();
  }

  async archiveOpenStory(): Promise<void> {
    const dialog = this.openDialog();
    await dialog.getByRole('button', { name: 'Archive' }).click();
    await this.page
      .getByRole('dialog', { name: /Archive QBC-/ })
      .getByRole('button', { name: 'Archive' })
      .click();
    await expect(dialog).toBeHidden();
  }

  async restoreOpenStory(): Promise<void> {
    const dialog = this.openDialog();
    await dialog.getByRole('button', { name: 'Restore as draft' }).click();
    await expect(dialog).toBeHidden();
  }

  private openDialog() {
    return this.page
      .getByRole('dialog')
      .filter({ has: this.page.getByRole('button', { name: 'Save story' }) });
  }
}
