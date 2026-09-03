import { expect, Page } from '@playwright/test';

export class BoardPage {
  constructor(private readonly page: Page) {}

  async expectActiveSprint(): Promise<void> {
    await expect(this.page.getByText(/Current sprint/)).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'To do' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'In progress' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Done' })).toBeVisible();
  }

  async expectWorkspace(): Promise<void> {
    await expect(this.page.getByRole('region', { name: 'Current sprint summary' }).or(this.page.getByRole('heading', { name: 'No active sprint' }))).toBeVisible();
  }

  async moveStoryForward(title: string): Promise<void> {
    const card = this.page.locator('.story-card').filter({ hasText: title });
    const moveResponse = this.page.waitForResponse(response =>
      response.request().method() === 'POST' && response.url().endsWith('/move')
    );
    const boardResponse = this.page.waitForResponse(response =>
      response.request().method() === 'GET' && response.url().endsWith('/api/sprints/active/board')
    );
    await card.getByRole('button', { name: new RegExp(`Move ${title} forward`) }).click();
    expect((await moveResponse).ok()).toBeTruthy();
    expect((await boardResponse).ok()).toBeTruthy();
    await expect(this.page.getByText('Story moved.')).toBeVisible();
  }

  async moveStoryForwardIfPresent(title: string): Promise<void> {
    if (await this.page.locator('.story-card').filter({ hasText: title }).count() > 0) await this.moveStoryForward(title);
  }

  async createSprint(name: string, goal: string, startDate: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Manage sprints', exact: true }).click();
    const manager = this.page.getByRole('dialog', { name: 'Manage sprints' });
    await manager.getByRole('button', { name: /New sprint/ }).click();
    const form = this.page.getByRole('dialog', { name: 'New sprint' });
    await form.getByLabel('Name *').fill(name);
    await form.getByLabel('Goal *').fill(goal);
    await form.getByLabel('Start date *').fill(startDate);
    await form.getByRole('button', { name: 'Save sprint' }).click();
    await expect(manager.getByRole('heading', { name: new RegExp(`^${this.escape(name)} planned$`) })).toBeVisible();
    await manager.getByRole('button', { name: 'Close', exact: true }).last().click();
  }

  async completeActiveSprintIfPresent(): Promise<void> {
    await expect(
      this.page
        .getByRole('region', { name: 'Current sprint summary' })
        .or(this.page.getByRole('heading', { name: 'No active sprint' }))
    ).toBeVisible();
    const complete = this.page.getByRole('button', { name: 'Complete sprint' });
    if (await complete.count() === 0) return;
    await complete.click();
    const confirmation = this.page.getByRole('dialog').filter({ has: this.page.getByRole('button', { name: 'Complete sprint' }) });
    await confirmation.getByRole('button', { name: 'Complete sprint' }).click();
    await expect(this.page.getByRole('heading', { name: 'No active sprint' })).toBeVisible();
  }

  async startSprint(name: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Manage sprints', exact: true }).click();
    const manager = this.page.getByRole('dialog', { name: 'Manage sprints' });
    const sprint = manager.locator('.sprint-row').filter({ hasText: name });
    await sprint.getByRole('button', { name: 'Start' }).click();
    await this.page.getByRole('dialog', { name: `Start ${name}?` }).getByRole('button', { name: 'Start sprint' }).click();
    await manager.getByRole('button', { name: 'Close', exact: true }).last().click();
    await expect(this.page.getByText(`Current sprint · ${name}`)).toBeVisible();
  }

  async expectStoryInDone(title: string): Promise<void> {
    const done = this.page.locator('.board-column').filter({ has: this.page.getByRole('heading', { name: 'Done' }) });
    await expect(done.getByRole('heading', { name: title })).toBeVisible();
  }

  async reloadAndExpectStoryInDone(title: string): Promise<void> {
    await this.page.reload();
    await this.expectStoryInDone(title);
  }

  private escape(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
