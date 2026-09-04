import { expect, Locator, Page } from '@playwright/test';

export type BoardColumnName = 'To do' | 'In progress' | 'Done';

/** The board's columns, in the order the product lays them out. */
const COLUMNS: readonly BoardColumnName[] = ['To do', 'In progress', 'Done'];

export class BoardPage {
  constructor(private readonly page: Page) {}

  async expectActiveSprint(): Promise<void> {
    await expect(this.summary()).toBeVisible();
    for (const column of COLUMNS)
      await expect(this.page.getByRole('heading', { name: column })).toBeVisible();
  }

  async expectWorkspace(): Promise<void> {
    await expect(
      this.summary().or(this.page.getByRole('heading', { name: 'No active sprint' })),
    ).toBeVisible();
  }

  /** Everything the board promises about the sprint it is showing. */
  async expectSprintSummary(detail: {
    readonly name: string;
    readonly goal: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly done: number;
    readonly total: number;
    readonly percentage: number;
  }): Promise<void> {
    const summary = this.summary();
    await expect(summary).toContainText(`Current sprint · ${detail.name}`);
    await expect(summary).toContainText(detail.goal);
    await expect(summary).toContainText(`${detail.startDate} – ${detail.endDate}`);
    await expect(summary).toContainText(`${detail.done} of ${detail.total} stories complete`);
    await this.expectCompletionPercentage(detail.percentage);
  }

  async expectCompletionPercentage(percentage: number): Promise<void> {
    await expect(this.summary()).toContainText(`${percentage}%`);
    await expect(this.page.getByRole('progressbar', { name: 'Sprint completion' })).toHaveAttribute(
      'aria-valuenow',
      String(percentage),
    );
  }

  async expectNoActiveSprint(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'No active sprint' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Choose a sprint' })).toBeVisible();
  }

  async expectStoryInColumn(title: string, column: BoardColumnName): Promise<void> {
    await expect(this.column(column).getByRole('heading', { name: title })).toBeVisible();
    await expect(this.page.locator('.story-card').filter({ hasText: title })).toHaveCount(1);
  }

  async expectColumnCount(column: BoardColumnName, count: number): Promise<void> {
    await expect(this.column(column).locator('qbc-count')).toHaveText(String(count));
  }

  async expectEmptyColumn(column: BoardColumnName): Promise<void> {
    await this.expectColumnCount(column, 0);
    await expect(this.column(column)).toContainText('No stories here');
  }

  /** Everything a card promises about the story it stands for. */
  async expectCardDetail(
    title: string,
    detail: {
      readonly key: string;
      readonly epic: string;
      readonly points: string;
      readonly owner: string;
      readonly tasks?: string;
    },
  ): Promise<void> {
    const card = this.card(title);
    await expect(card).toContainText(detail.key);
    await expect(card).toContainText(
      detail.tasks ? `${detail.epic} · ${detail.tasks}` : detail.epic,
    );
    await expect(card.getByRole('img', { name: detail.points })).toBeVisible();
    await expect(card).toContainText(detail.owner);
  }

  async expectNoTaskCount(title: string): Promise<void> {
    await expect(this.card(title)).not.toContainText('tasks');
  }

  async moveStoryForward(title: string): Promise<void> {
    await this.move(title, `Move ${title} forward`);
  }

  async moveStoryBackward(title: string): Promise<void> {
    await this.move(title, `Move ${title} backward`);
  }

  async moveStoryForwardIfPresent(title: string): Promise<void> {
    if ((await this.card(title).count()) > 0) await this.moveStoryForward(title);
  }

  /**
   * Reproduces a pointer drag between columns. The board moves a story on the data the drag
   * carries, so the test hands the same transfer object to each stage exactly as a pointer does.
   */
  async dragStoryToColumn(title: string, column: BoardColumnName): Promise<void> {
    await expect(this.card(title)).toBeVisible();
    const moved = this.page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().endsWith('/move'),
    );
    await this.card(title).evaluate((from, columnIndex) => {
      const to = document.querySelectorAll('.board-column')[columnIndex];
      if (!to) throw new Error('The board has no column at that position.');
      const transfer = new DataTransfer();
      from.dispatchEvent(new DragEvent('dragstart', { dataTransfer: transfer, bubbles: true }));
      to.dispatchEvent(
        new DragEvent('dragover', { dataTransfer: transfer, bubbles: true, cancelable: true }),
      );
      to.dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true }));
    }, COLUMNS.indexOf(column));
    expect((await moved).ok()).toBeTruthy();
    await expect(this.page.getByText('Story moved.')).toBeVisible();
  }

  async completeActiveSprint(): Promise<void> {
    await this.page.getByRole('button', { name: 'Complete sprint' }).click();
    const confirmation = this.confirmation('Complete sprint');
    await expect(confirmation).toContainText('Done stories remain in history');
    await confirmation.getByRole('button', { name: 'Complete sprint' }).click();
    await expect(this.page.getByRole('heading', { name: 'No active sprint' })).toBeVisible();
  }

  async completeActiveSprintIfPresent(): Promise<void> {
    await this.expectWorkspace();
    if ((await this.page.getByRole('button', { name: 'Complete sprint' }).count()) === 0) return;
    await this.completeActiveSprint();
  }

  /** The confirmation names the sprint and explains the consequence, then leaves data alone. */
  async expectCompletionCancelKeepsSprint(name: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Complete sprint' }).click();
    const confirmation = this.page.getByRole('dialog', { name: `Complete ${name}?` });
    await expect(confirmation).toContainText(
      'Done stories remain in history. Unfinished stories return Ready to the backlog.',
    );
    await confirmation.getByRole('button', { name: 'Cancel' }).click();
    await expect(this.summary()).toContainText(`Current sprint · ${name}`);
  }

  async openSprintManager(): Promise<void> {
    await this.page.getByRole('button', { name: 'Manage sprints', exact: true }).click();
    await expect(this.page.getByRole('dialog', { name: 'Manage sprints' })).toBeVisible();
  }

  async openSprintManagerFromEmptyState(): Promise<void> {
    await this.page.getByRole('button', { name: 'Choose a sprint' }).click();
    await expect(this.page.getByRole('dialog', { name: 'Manage sprints' })).toBeVisible();
  }

  async openStory(title: string): Promise<void> {
    await this.card(title).getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(
      this.page
        .getByRole('dialog')
        .filter({ has: this.page.getByRole('button', { name: 'Save story' }) }),
    ).toBeVisible();
  }

  async reloadAndExpectStoryInColumn(title: string, column: BoardColumnName): Promise<void> {
    await this.page.reload();
    await this.expectStoryInColumn(title, column);
  }

  /** Three columns fit side by side when the viewport has room for them. */
  async expectThreeColumnLayout(): Promise<void> {
    const lefts = await this.page
      .locator('.board-column')
      .evaluateAll((columns) => columns.map((column) => column.getBoundingClientRect().left));
    expect(new Set(lefts.map(Math.round)).size, 'the columns are not side by side').toBe(3);
  }

  async expectSingleColumnLayout(): Promise<void> {
    const lefts = await this.page
      .locator('.board-column')
      .evaluateAll((columns) => columns.map((column) => column.getBoundingClientRect().left));
    expect(new Set(lefts.map(Math.round)).size, 'the columns are not stacked').toBe(1);
  }

  /**
   * Three columns still fit on a tablet in landscape, so the cards are at their narrowest
   * there. A card breaks text anywhere to contain a long unspaced title, and an action
   * caught by that rule runs down the card one letter per line, so the labels have to
   * measure wider than they are tall.
   */
  async expectStoryActionsOnOneLine(): Promise<void> {
    const cards = this.page.locator('.story-card');
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      const box = await card.getByRole('button', { name: 'Edit', exact: true }).boundingBox();
      expect(box, 'the Edit action has no layout box').not.toBeNull();
      expect(box!.width).toBeGreaterThan(box!.height);
    }
  }

  /** Movement works from a touch device, with no hover and no drag. */
  async tapStoryForward(title: string): Promise<void> {
    const moved = this.page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().endsWith('/move'),
    );
    await this.card(title)
      .getByRole('button', { name: `Move ${title} forward` })
      .tap();
    expect((await moved).ok()).toBeTruthy();
    await expect(this.page.getByText('Story moved.')).toBeVisible();
  }

  private async move(title: string, action: string): Promise<void> {
    const moved = this.page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().endsWith('/move'),
    );
    const reloaded = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().endsWith('/api/sprints/active/board'),
    );
    await this.card(title).getByRole('button', { name: action }).click();
    expect((await moved).ok()).toBeTruthy();
    expect((await reloaded).ok()).toBeTruthy();
    await expect(this.page.getByText('Story moved.')).toBeVisible();
  }

  private card(title: string): Locator {
    return this.page.locator('.story-card').filter({ hasText: title });
  }

  private column(name: BoardColumnName): Locator {
    return this.page
      .locator('.board-column')
      .filter({ has: this.page.getByRole('heading', { name, exact: true }) });
  }

  private summary(): Locator {
    return this.page.getByRole('region', { name: 'Current sprint summary' });
  }

  private confirmation(action: string): Locator {
    return this.page
      .getByRole('dialog')
      .filter({ has: this.page.getByRole('button', { name: action, exact: true }) });
  }
}
