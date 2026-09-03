import { expect, Page } from '@playwright/test';

export class HierarchyPage {
  constructor(private readonly page: Page) {}

  async createInitiative(name: string, description: string): Promise<void> {
    await this.page
      .getByRole('button', { name: /New initiative/ })
      .first()
      .click();
    const dialog = this.page.getByRole('dialog', { name: 'New initiative' });
    await dialog.getByLabel('Name *').fill(name);
    await dialog.getByLabel('Outcome description *').fill(description);
    await dialog.getByRole('button', { name: 'Save initiative' }).click();
    await expect(this.initiative(name)).toBeVisible();
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

  async createAndDeleteInitiative(name: string): Promise<void> {
    await this.createInitiative(name, 'Acceptance-test outcome.');
    const card = this.initiative(name);
    await card.getByRole('button', { name: 'Delete' }).click();
    await this.page
      .getByRole('dialog', { name: `Delete ${name}?` })
      .getByRole('button', { name: 'Delete initiative' })
      .click();
    await expect(card).toHaveCount(0);
  }

  private initiative(name: string) {
    return this.page.locator('.initiative-card').filter({ hasText: name });
  }
}
