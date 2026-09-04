import { expect, Locator, Page } from '@playwright/test';

export type BacklogFilterName = 'All stories' | 'Unscheduled' | 'Ready' | 'Draft' | 'Archived';
export type BacklogState = 'archived' | 'draft' | 'ready' | 'active';

export class BacklogPage {
  constructor(private readonly page: Page) {}

  async search(text: string): Promise<void> {
    await this.searchField().fill(text);
  }

  async clearSearch(): Promise<void> {
    await this.searchField().fill('');
  }

  async filterBy(name: BacklogFilterName): Promise<void> {
    await this.page.getByRole('combobox', { name: 'Filter backlog' }).selectOption({ label: name });
  }

  async expectStory(title: string): Promise<void> {
    await expect(this.story(title)).toBeVisible();
  }

  async expectNoStory(title: string): Promise<void> {
    await expect(this.story(title)).toHaveCount(0);
  }

  /** Exactly these stories are listed, in any order. */
  async expectOnlyStories(...titles: string[]): Promise<void> {
    await expect(this.rows()).toHaveCount(titles.length);
    for (const title of titles) await expect(this.story(title)).toBeVisible();
  }

  async expectStoryCount(count: number): Promise<void> {
    await expect(this.rows()).toHaveCount(count);
  }

  /** Every column the backlog promises to show for a story. */
  async expectRowDetail(
    title: string,
    detail: {
      readonly key: string;
      readonly initiative: string;
      readonly epic: string;
      readonly state: BacklogState;
      /** The estimate's accessible name, such as `5 story points` or `Not estimated`. */
      readonly points: string;
      readonly sprint: string;
    },
  ): Promise<void> {
    const row = this.story(title);
    await expect(row).toContainText(detail.key);
    await expect(row).toContainText(`${detail.initiative} / ${detail.epic}`);
    await expect(row.locator('.pill')).toHaveText(detail.state);
    await expect(row.getByRole('img', { name: detail.points })).toBeVisible();
    await this.expectSprintAssignment(title, detail.sprint);
  }

  async expectSprintAssignment(title: string, sprintName: string): Promise<void> {
    const assignment = this.sprintControl(title);
    await expect(assignment.locator('option:checked')).toHaveText(sprintName);
  }

  async expectSprintAssignmentUnavailable(title: string): Promise<void> {
    await expect(this.sprintControl(title)).toBeDisabled();
  }

  async openStory(title: string): Promise<void> {
    await this.story(title).getByRole('button', { name: 'Open' }).click();
    const editor = this.page
      .getByRole('dialog')
      .filter({ has: this.page.getByRole('button', { name: 'Save story' }) });
    await expect(editor).toBeVisible();
    await expect(editor.getByLabel('Title *')).toHaveValue(title);
  }

  async groomStory(title: string): Promise<void> {
    await this.story(title).getByRole('button', { name: 'Groom' }).click();
    await expect(this.story(title).locator('.pill')).toHaveText('ready');
  }

  /** Grooming is refused, and the reader is told which fields are missing. */
  async expectGroomingRejected(title: string, detail: string | RegExp): Promise<void> {
    await this.story(title).getByRole('button', { name: 'Groom' }).click();
    await expect(this.page.getByRole('alert').first()).toContainText(detail);
    await expect(this.story(title).locator('.pill')).not.toHaveText('ready');
  }

  async markUnready(title: string): Promise<void> {
    await this.story(title).getByRole('button', { name: 'Mark unready' }).click();
    await expect(this.story(title).locator('.pill')).toHaveText('active');
  }

  async expectUnreadyRejected(title: string, detail: string | RegExp): Promise<void> {
    await this.story(title).getByRole('button', { name: 'Mark unready' }).click();
    await expect(this.page.getByRole('alert').first()).toContainText(detail);
    await expect(this.story(title).locator('.pill')).toHaveText('ready');
  }

  async expectNoReadinessChange(title: string): Promise<void> {
    await expect(this.story(title).getByRole('button', { name: 'Mark unready' })).toHaveCount(0);
    await expect(this.story(title).getByRole('button', { name: 'Groom' })).toHaveCount(0);
  }

  async assignStory(title: string, sprintName: string): Promise<void> {
    await this.sprintControl(title).selectOption({ label: sprintName });
    await expect(this.page.getByText('Story assigned to sprint.')).toBeVisible();
  }

  async returnStoryToBacklog(title: string): Promise<void> {
    await this.sprintControl(title).selectOption({ label: 'Backlog' });
    await expect(this.page.getByText('Story returned to backlog.')).toBeVisible();
  }

  async expectState(title: string, state: BacklogState): Promise<void> {
    await expect(this.story(title).locator('.pill')).toHaveText(state);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'No matching stories' })).toBeVisible();
  }

  /** The empty result is a place to start work, not a dead end. */
  async createStoryFromEmptyState(): Promise<void> {
    await this.page
      .locator('qbc-empty-state')
      .getByRole('button', { name: 'New story', exact: true })
      .click();
    await expect(this.page.getByRole('dialog', { name: 'New story' })).toBeVisible();
  }

  async reloadAndExpectStory(title: string): Promise<void> {
    await this.page.reload();
    await expect(this.page.getByRole('heading', { level: 1, name: 'Backlog' })).toBeVisible();
    await this.expectStory(title);
  }

  /** Each row states its lifecycle in words, so status never depends on colour alone. */
  async expectStatusInWords(...states: BacklogState[]): Promise<void> {
    for (const state of states)
      await expect(this.page.locator('.data-row .pill', { hasText: state }).first()).toBeVisible();
  }

  /** Rows stack instead of running off the side of a narrow viewport. */
  async expectSingleColumnRows(): Promise<void> {
    const boxes = await this.rows().evaluateAll((rows) =>
      rows.map((row) => row.getBoundingClientRect().left),
    );
    expect(new Set(boxes.map(Math.round)).size, 'rows are not in one column').toBe(1);
  }

  private rows(): Locator {
    return this.page.locator('.data-row');
  }

  private story(title: string): Locator {
    return this.rows().filter({ hasText: title });
  }

  private sprintControl(title: string): Locator {
    return this.story(title).getByRole('combobox', { name: 'Sprint assignment' });
  }

  private searchField(): Locator {
    return this.page.getByRole('textbox', { name: 'Search backlog' });
  }
}
