import { expect, Locator, Page } from '@playwright/test';

export type SprintStatus = 'planned' | 'active' | 'completed';

export class SprintManagerPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.getByRole('button', { name: 'Manage sprints', exact: true }).click();
    await expect(this.manager()).toBeVisible();
  }

  async close(): Promise<void> {
    await this.manager().getByRole('button', { name: 'Close', exact: true }).last().click();
    await expect(this.manager()).toBeHidden();
  }

  async createSprint(name: string, goal: string, startDate: string): Promise<void> {
    await this.openForm();
    const form = this.page.getByRole('dialog', { name: 'New sprint' });
    await form.getByLabel('Name *').fill(name);
    await form.getByLabel('Goal *').fill(goal);
    await form.getByLabel('Start date *').fill(startDate);
    await form.getByRole('button', { name: 'Save sprint' }).click();
    await expect(this.sprint(name)).toBeVisible();
    await this.expectStatus(name, 'planned');
  }

  /** A save the form refuses names every field that is still missing. */
  async expectFormRejects(fields: string[]): Promise<void> {
    await this.openForm();
    const form = this.page.getByRole('dialog', { name: 'New sprint' });
    await form.getByLabel('Name *').fill('');
    await form.getByLabel('Goal *').fill('');
    await form.getByRole('button', { name: 'Save sprint' }).click();
    const alert = form.getByRole('alert');
    for (const field of fields) await expect(alert).toContainText(field);
    await form.getByRole('button', { name: 'Cancel' }).click();
  }

  /** The server refuses a name another sprint already uses, and says so. */
  async expectDuplicateNameRejected(name: string, goal: string, startDate: string): Promise<void> {
    await this.openForm();
    const form = this.page.getByRole('dialog', { name: 'New sprint' });
    await form.getByLabel('Name *').fill(name);
    await form.getByLabel('Goal *').fill(goal);
    await form.getByLabel('Start date *').fill(startDate);
    await form.getByRole('button', { name: 'Save sprint' }).click();
    await expect(this.page.getByRole('alert').first()).toContainText(
      'Another sprint already uses that name.',
    );
    await expect(form).toBeVisible();
    await form.getByRole('button', { name: 'Cancel' }).click();
    await expect(this.sprints().filter({ hasText: name })).toHaveCount(1);
  }

  async updateSprint(
    name: string,
    detail: { readonly name?: string; readonly goal?: string; readonly startDate?: string },
  ): Promise<void> {
    await this.sprint(name).getByRole('button', { name: 'Edit', exact: true }).click();
    const form = this.page.getByRole('dialog', { name: 'Edit sprint' });
    if (detail.name !== undefined) await form.getByLabel('Name *').fill(detail.name);
    if (detail.goal !== undefined) await form.getByLabel('Goal *').fill(detail.goal);
    if (detail.startDate !== undefined)
      await form.getByLabel('Start date *').fill(detail.startDate);
    await form.getByRole('button', { name: 'Save sprint' }).click();
    await expect(form).toBeHidden();
  }

  /** A completed sprint keeps the dates it ran on, so its start date cannot be retyped. */
  async expectStartDateReadOnly(name: string): Promise<void> {
    await this.sprint(name).getByRole('button', { name: 'Edit', exact: true }).click();
    const form = this.page.getByRole('dialog', { name: 'Edit sprint' });
    await expect(form.getByLabel('Start date *')).toHaveAttribute('readonly', '');
    await form.getByRole('button', { name: 'Cancel' }).click();
  }

  async startSprint(name: string): Promise<void> {
    await this.sprint(name).getByRole('button', { name: 'Start' }).click();
    const confirmation = this.page.getByRole('dialog', { name: `Start ${name}?` });
    await expect(confirmation).toContainText('active commitment on the board');
    await confirmation.getByRole('button', { name: 'Start sprint' }).click();
    await this.expectStatus(name, 'active');
  }

  /** Starting a second sprint is refused, and the sprint that is running is untouched. */
  async expectStartRejected(name: string, activeName: string): Promise<void> {
    await this.sprint(name).getByRole('button', { name: 'Start' }).click();
    await this.page
      .getByRole('dialog', { name: `Start ${name}?` })
      .getByRole('button', { name: 'Start sprint' })
      .click();
    await expect(this.page.getByRole('alert').first()).toContainText(
      'Complete the active sprint before starting another one.',
    );
    await this.expectStatus(name, 'planned');
    await this.expectStatus(activeName, 'active');
  }

  async deleteSprint(name: string): Promise<void> {
    const row = this.sprint(name);
    await row.getByRole('button', { name: 'Delete', exact: true }).click();
    const confirmation = this.page.getByRole('dialog', { name: `Delete ${name}?` });
    await expect(confirmation).toContainText('return to the Ready backlog');
    await confirmation.getByRole('button', { name: 'Delete sprint' }).click();
    await expect(row).toHaveCount(0);
  }

  /** An active or completed sprint offers no way to delete it. */
  async expectNoDeleteAction(name: string): Promise<void> {
    await expect(
      this.sprint(name).getByRole('button', { name: 'Delete', exact: true }),
    ).toHaveCount(0);
  }

  async expectNoStartAction(name: string): Promise<void> {
    await expect(this.sprint(name).getByRole('button', { name: 'Start' })).toHaveCount(0);
  }

  async expectStatus(name: string, status: SprintStatus): Promise<void> {
    await expect(
      this.manager().getByRole('heading', { name: new RegExp(`^${this.escape(name)} ${status}$`) }),
    ).toBeVisible();
  }

  /** The inclusive two-week range the product derives from a start date. */
  async expectDates(name: string, range: string): Promise<void> {
    await expect(this.sprint(name)).toContainText(range);
  }

  async expectStoryCount(name: string, count: number): Promise<void> {
    await expect(this.sprint(name)).toContainText(`${count} stories`);
  }

  async expectGoal(name: string, goal: string): Promise<void> {
    await expect(this.sprint(name)).toContainText(goal);
  }

  async expectSprintCount(count: number): Promise<void> {
    await expect(this.sprints()).toHaveCount(count);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.manager().getByRole('heading', { name: 'No sprints yet' })).toBeVisible();
  }

  /** Every sprint states its status in words, not by colour alone. */
  async expectStatusInWords(...statuses: SprintStatus[]): Promise<void> {
    for (const status of statuses)
      await expect(this.manager().locator('.sprint-row .pill', { hasText: status })).toHaveCount(1);
  }

  private async openForm(): Promise<void> {
    await this.manager()
      .getByRole('button', { name: /New sprint/ })
      .click();
    await expect(this.page.getByRole('dialog', { name: 'New sprint' })).toBeVisible();
  }

  private manager(): Locator {
    return this.page.getByRole('dialog', { name: 'Manage sprints' });
  }

  private sprints(): Locator {
    return this.manager().locator('.sprint-row');
  }

  private sprint(name: string): Locator {
    return this.sprints().filter({ hasText: name });
  }

  private escape(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
