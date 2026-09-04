import { expect, Locator, Page } from '@playwright/test';

export interface StoryDetail {
  readonly title: string;
  readonly epic: string;
  readonly owner?: string;
  readonly description?: string;
  readonly acceptanceCriteria?: string;
  readonly points?: string;
}

export interface TaskDetail {
  readonly title: string;
  readonly assignee?: string;
  readonly complete?: boolean;
}

export class StoryEditorPage {
  constructor(private readonly page: Page) {}

  async openNewStory(): Promise<void> {
    await this.page.getByRole('button', { name: /New story/ }).click();
    await expect(this.page.getByRole('dialog', { name: 'New story' })).toBeVisible();
  }

  /** Fills the open editor without saving, so a test can decide what happens next. */
  async fill(detail: StoryDetail): Promise<void> {
    const dialog = this.dialog();
    await dialog.getByLabel('Title *').fill(detail.title);
    await dialog.getByLabel('Epic *').selectOption({ label: detail.epic });
    if (detail.owner) await dialog.getByLabel('Owner').selectOption({ label: detail.owner });
    if (detail.description !== undefined)
      await dialog.getByLabel('Description or user story').fill(detail.description);
    if (detail.acceptanceCriteria !== undefined)
      await dialog.getByLabel('Acceptance criteria').fill(detail.acceptanceCriteria);
    if (detail.points)
      await dialog.getByLabel('Story points').selectOption({ label: detail.points });
  }

  async addTask(task: TaskDetail): Promise<void> {
    const dialog = this.dialog();
    const index = (await this.taskRows().count()) + 1;
    await dialog.getByRole('button', { name: /Add task/ }).click();
    await dialog.getByLabel(`Task ${index} title`).fill(task.title);
    if (task.assignee)
      await dialog.getByLabel(`Task ${index} assignee`).selectOption({ label: task.assignee });
    if (task.complete) await dialog.getByLabel(`Complete task ${index}`).check();
  }

  /** A newly added task starts incomplete, before anything is saved. */
  async expectTaskIncomplete(position: number): Promise<void> {
    await expect(this.dialog().getByLabel(`Complete task ${position}`)).not.toBeChecked();
  }

  async addEmptyTask(): Promise<void> {
    await this.dialog()
      .getByRole('button', { name: /Add task/ })
      .click();
  }

  async updateTask(position: number, task: TaskDetail): Promise<void> {
    const dialog = this.dialog();
    await dialog.getByLabel(`Task ${position} title`).fill(task.title);
    if (task.assignee)
      await dialog.getByLabel(`Task ${position} assignee`).selectOption({ label: task.assignee });
    if (task.complete !== undefined) {
      const checkbox = dialog.getByLabel(`Complete task ${position}`);
      if (task.complete) await checkbox.check();
      else await checkbox.uncheck();
    }
  }

  async removeTask(position: number): Promise<void> {
    await this.dialog()
      .getByRole('button', { name: `Remove task ${position}` })
      .click();
  }

  async expectTaskCount(count: number): Promise<void> {
    await expect(this.taskRows()).toHaveCount(count);
  }

  async expectTask(position: number, task: TaskDetail): Promise<void> {
    const dialog = this.dialog();
    await expect(dialog.getByLabel(`Task ${position} title`)).toHaveValue(task.title);
    if (task.assignee)
      await expect(
        dialog.getByLabel(`Task ${position} assignee`).locator('option:checked'),
      ).toHaveText(task.assignee);
    if (task.complete !== undefined) {
      const checkbox = dialog.getByLabel(`Complete task ${position}`);
      if (task.complete) await expect(checkbox).toBeChecked();
      else await expect(checkbox).not.toBeChecked();
    }
  }

  async save(): Promise<void> {
    await this.dialog().getByRole('button', { name: 'Save story' }).click();
    await expect(this.dialog()).toBeHidden();
  }

  /** The save is refused and the editor stays open, naming every field that stopped it. */
  async expectSaveRejected(...fields: string[]): Promise<void> {
    const dialog = this.dialog();
    await dialog.getByRole('button', { name: 'Save story' }).click();
    const alert = dialog.getByRole('alert').first();
    for (const field of fields) await expect(alert).toContainText(field);
    await expect(dialog).toBeVisible();
  }

  async createStory(detail: StoryDetail, task?: TaskDetail): Promise<void> {
    await this.openNewStory();
    await this.fill(detail);
    if (task) await this.addTask(task);
    await this.save();
  }

  /** Every field the editor holds for a story, as it is offered for review. */
  async expectStoryDetail(detail: StoryDetail): Promise<void> {
    const dialog = this.dialog();
    await expect(dialog.getByLabel('Title *')).toHaveValue(detail.title);
    await expect(dialog.getByLabel('Epic *').locator('option:checked')).toHaveText(detail.epic);
    if (detail.owner)
      await expect(dialog.getByLabel('Owner').locator('option:checked')).toHaveText(detail.owner);
    if (detail.description !== undefined)
      await expect(dialog.getByLabel('Description or user story')).toHaveValue(detail.description);
    if (detail.acceptanceCriteria !== undefined)
      await expect(dialog.getByLabel('Acceptance criteria')).toHaveValue(detail.acceptanceCriteria);
    if (detail.points)
      await expect(dialog.getByLabel('Story points').locator('option:checked')).toHaveText(
        detail.points,
      );
  }

  async expectStoryKey(key: string): Promise<void> {
    await expect(this.page.getByRole('dialog', { name: key })).toBeVisible();
  }

  /** The estimate control offers the product's scale and nothing else. */
  async expectEstimateOptions(...labels: string[]): Promise<void> {
    await expect(this.dialog().getByLabel('Story points').locator('option')).toHaveText(labels);
  }

  async setOwner(name: string): Promise<void> {
    await this.dialog().getByLabel('Owner').selectOption({ label: name });
  }

  async archiveOpenStory(): Promise<void> {
    const dialog = this.dialog();
    await dialog.getByRole('button', { name: 'Archive' }).click();
    const confirmation = this.page.getByRole('dialog', { name: /Archive QBC-/ });
    await expect(confirmation).toContainText('Archived backlog filter');
    await confirmation.getByRole('button', { name: 'Archive' }).click();
    await expect(dialog).toBeHidden();
  }

  async expectArchiveRejected(detail: string | RegExp): Promise<void> {
    const dialog = this.dialog();
    await dialog.getByRole('button', { name: 'Archive' }).click();
    await this.page
      .getByRole('dialog', { name: /Archive QBC-/ })
      .getByRole('button', { name: 'Archive' })
      .click();
    await expect(dialog.getByRole('alert').first()).toContainText(detail);
    await expect(dialog).toBeVisible();
  }

  async restoreOpenStory(): Promise<void> {
    const dialog = this.dialog();
    await dialog.getByRole('button', { name: 'Restore as draft' }).click();
    await expect(dialog).toBeHidden();
  }

  async deleteOpenStory(): Promise<void> {
    const dialog = this.dialog();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    const confirmation = this.page.getByRole('dialog', { name: /Permanently delete QBC-/ });
    await expect(confirmation).toContainText('cannot be undone');
    await confirmation.getByRole('button', { name: 'Delete permanently' }).click();
    await expect(dialog).toBeHidden();
  }

  async expectDeleteRejected(detail: string | RegExp): Promise<void> {
    const dialog = this.dialog();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await this.page
      .getByRole('dialog', { name: /Permanently delete QBC-/ })
      .getByRole('button', { name: 'Delete permanently' })
      .click();
    await expect(dialog.getByRole('alert').first()).toContainText(detail);
    await expect(dialog).toBeVisible();
  }

  async close(): Promise<void> {
    const dialog = this.dialog();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
  }

  async expectOpen(): Promise<void> {
    await expect(this.dialog()).toBeVisible();
  }

  private dialog(): Locator {
    return this.page
      .getByRole('dialog')
      .filter({ has: this.page.getByRole('button', { name: 'Save story' }) });
  }

  private taskRows(): Locator {
    return this.page.locator('qbc-task-item');
  }
}
