import { expect, Locator, Page } from '@playwright/test';

export class HierarchyPage {
  constructor(private readonly page: Page) {}

  async createInitiative(name: string, description: string): Promise<void> {
    await this.openInitiativeForm();
    const dialog = this.page.getByRole('dialog', { name: 'New initiative' });
    await dialog.getByLabel('Name *').fill(name);
    await dialog.getByLabel('Outcome description *').fill(description);
    await dialog.getByRole('button', { name: 'Save initiative' }).click();
    await expect(this.initiative(name)).toBeVisible();
  }

  /** A save the form refuses names every field that is still missing. */
  async expectInitiativeRejected(...fields: string[]): Promise<void> {
    await this.openInitiativeForm();
    const dialog = this.page.getByRole('dialog', { name: 'New initiative' });
    await dialog.getByRole('button', { name: 'Save initiative' }).click();
    const alert = dialog.getByRole('alert');
    for (const field of fields) await expect(alert).toContainText(field);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  }

  async updateInitiative(name: string, newName: string, newDescription: string): Promise<void> {
    await this.initiativeActions(name).getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Edit initiative' });
    await dialog.getByLabel('Name *').fill(newName);
    await dialog.getByLabel('Outcome description *').fill(newDescription);
    await dialog.getByRole('button', { name: 'Save initiative' }).click();
    await expect(this.initiative(newName)).toContainText(newDescription);
  }

  async createEpic(initiativeName: string, epicName: string, summary: string): Promise<void> {
    const initiative = this.initiative(initiativeName);
    await initiative.getByRole('button', { name: /Epic/ }).click();
    const dialog = this.page.getByRole('dialog', { name: 'New epic' });
    await dialog.getByLabel('Name *').fill(epicName);
    await dialog.getByLabel('Summary *').fill(summary);
    await dialog.getByRole('button', { name: 'Save epic' }).click();
    await expect(initiative.getByText(epicName, { exact: true })).toBeVisible();
  }

  /** Adding an epic in the context of an initiative arrives with that initiative chosen. */
  async expectInitiativePreselected(initiativeName: string): Promise<void> {
    await this.initiative(initiativeName).getByRole('button', { name: /Epic/ }).click();
    const dialog = this.page.getByRole('dialog', { name: 'New epic' });
    await expect(dialog.getByLabel('Initiative *').locator('option:checked')).toHaveText(
      initiativeName,
    );
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  }

  async updateEpic(epicName: string, newName: string, newSummary: string): Promise<void> {
    await this.epic(epicName).getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Edit epic' });
    await dialog.getByLabel('Name *').fill(newName);
    await dialog.getByLabel('Summary *').fill(newSummary);
    await dialog.getByRole('button', { name: 'Save epic' }).click();
    await expect(this.epic(newName)).toContainText(newSummary);
  }

  async moveEpic(epicName: string, initiativeName: string): Promise<void> {
    await this.epic(epicName).getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Edit epic' });
    await dialog.getByLabel('Initiative *').selectOption({ label: initiativeName });
    await dialog.getByRole('button', { name: 'Save epic' }).click();
    await expect(
      this.initiative(initiativeName).getByText(epicName, { exact: true }),
    ).toBeVisible();
  }

  async deleteInitiative(name: string): Promise<void> {
    const card = this.initiative(name);
    await this.initiativeActions(name).getByRole('button', { name: 'Delete', exact: true }).click();
    const confirmation = this.page.getByRole('dialog', { name: `Delete ${name}?` });
    await expect(confirmation).toContainText('epics have been moved or removed');
    await confirmation.getByRole('button', { name: 'Delete initiative' }).click();
    await expect(card).toHaveCount(0);
  }

  async deleteEpic(name: string): Promise<void> {
    const row = this.epic(name);
    await row.getByRole('button', { name: 'Delete', exact: true }).click();
    const confirmation = this.page.getByRole('dialog', { name: `Delete ${name}?` });
    await expect(confirmation).toContainText('contains no stories');
    await confirmation.getByRole('button', { name: 'Delete epic' }).click();
    await expect(row).toHaveCount(0);
  }

  /** Deletion is refused, and the reader is told what has to move first. */
  async expectInitiativeDeletionRejected(name: string, detail: string): Promise<void> {
    await this.initiativeActions(name).getByRole('button', { name: 'Delete', exact: true }).click();
    await this.page
      .getByRole('dialog', { name: `Delete ${name}?` })
      .getByRole('button', { name: 'Delete initiative' })
      .click();
    await expect(this.page.getByRole('alert').first()).toContainText(detail);
    await expect(this.initiative(name)).toBeVisible();
  }

  async expectEpicDeletionRejected(name: string, detail: string): Promise<void> {
    await this.epic(name).getByRole('button', { name: 'Delete', exact: true }).click();
    await this.page
      .getByRole('dialog', { name: `Delete ${name}?` })
      .getByRole('button', { name: 'Delete epic' })
      .click();
    await expect(this.page.getByRole('alert').first()).toContainText(detail);
    await expect(this.epic(name)).toBeVisible();
  }

  /** Cancelling a destructive confirmation leaves the record exactly as it was. */
  async expectDeletionCancelKeepsInitiative(name: string): Promise<void> {
    await this.initiativeActions(name).getByRole('button', { name: 'Delete', exact: true }).click();
    const confirmation = this.page.getByRole('dialog', { name: `Delete ${name}?` });
    await expect(confirmation).toContainText(name);
    await confirmation.getByRole('button', { name: 'Cancel' }).click();
    await expect(confirmation).toBeHidden();
    await expect(this.initiative(name)).toBeVisible();
  }

  async expectInitiativeRollUp(name: string, epics: number, stories: number): Promise<void> {
    await expect(this.initiative(name)).toContainText(`${epics} epics · ${stories} stories`);
  }

  async expectEpicRollUp(name: string, stories: number, percentage: number): Promise<void> {
    const row = this.epic(name);
    await expect(row).toContainText(`${stories} stories`);
    await expect(row.getByRole('progressbar', { name: 'Epic completion' })).toHaveAttribute(
      'aria-valuenow',
      String(percentage),
    );
  }

  /** Every epic sits under exactly one initiative. */
  async expectEpicUnder(initiativeName: string, epicName: string): Promise<void> {
    await expect(this.epic(epicName)).toHaveCount(1);
    await expect(
      this.initiative(initiativeName).getByText(epicName, { exact: true }),
    ).toBeVisible();
  }

  async expectInitiativeCount(count: number): Promise<void> {
    await expect(this.page.locator('.initiative-card')).toHaveCount(count);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'No initiatives yet' })).toBeVisible();
    await expect(
      this.page.locator('qbc-empty-state').getByRole('button', { name: 'New initiative' }),
    ).toBeVisible();
  }

  async expectNoEpicsMessage(initiativeName: string): Promise<void> {
    await expect(this.initiative(initiativeName)).toContainText('No epics yet');
  }

  private async openInitiativeForm(): Promise<void> {
    await this.page
      .getByRole('button', { name: /New initiative/ })
      .first()
      .click();
    await expect(this.page.getByRole('dialog', { name: 'New initiative' })).toBeVisible();
  }

  private initiative(name: string): Locator {
    return this.page.locator('.initiative-card').filter({ hasText: name });
  }

  /** The initiative's own actions, which its epic rows must not be mistaken for. */
  private initiativeActions(name: string): Locator {
    return this.initiative(name).locator('article > header');
  }

  private epic(name: string): Locator {
    return this.page.locator('.epic-row').filter({ hasText: name });
  }
}
