import AxeBuilder from '@axe-core/playwright';
import { expect, Page } from '@playwright/test';

export class AccessibilityPage {
  constructor(private readonly page: Page) {}

  async expectNoSeriousViolations(): Promise<void> {
    const result = await new AxeBuilder({ page: this.page }).analyze();
    expect(result.violations.filter(violation => ['critical', 'serious'].includes(violation.impact ?? ''))).toEqual([]);
  }

  async expectKeyboardAndDialogAccess(): Promise<void> {
    await this.page.goto('/board');
    await this.page.keyboard.press('Tab');
    const skipLink = this.page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeFocused();
    await this.page.keyboard.press('Enter');
    await expect(this.page.locator('#main-content')).toBeFocused();

    await this.page.getByRole('button', { name: /New story/ }).click();
    await this.scanOpenDialog('New story');
    await this.page.keyboard.press('Escape');

    await this.page.goto('/initiatives');
    await this.page.getByRole('button', { name: /New initiative/ }).first().click();
    await this.scanOpenDialog('New initiative');
    await this.page.keyboard.press('Escape');
    const initiative = this.page.locator('.initiative-card').first();
    await initiative.getByRole('button', { name: /Epic/ }).click();
    await this.scanOpenDialog('New epic');
    await this.page.keyboard.press('Escape');
    await initiative.getByRole('button', { name: 'Delete' }).first().click();
    await this.scanOpenDialog(/Delete .+\?/);
    await this.page.keyboard.press('Escape');

    await this.page.goto('/assistants');
    await this.page.getByRole('button', { name: /New assistant/ }).first().click();
    await this.scanOpenDialog('New assistant');
    await this.page.keyboard.press('Escape');
    const assigned = this.page.locator('.assistant-card').filter({ hasText: 'Maya Chen' });
    await assigned.getByRole('button', { name: 'Delete' }).click();
    await this.scanOpenDialog('Reassign work first');
    await this.page.keyboard.press('Escape');

    await this.page.goto('/board');
    await this.page.getByRole('button', { name: 'Manage sprints', exact: true }).click();
    await this.scanOpenDialog('Manage sprints');
    await this.page.getByRole('dialog', { name: 'Manage sprints' }).getByRole('button', { name: /New sprint/ }).click();
    await this.scanOpenDialog('New sprint');
    await this.page.keyboard.press('Escape');
    await this.page.keyboard.press('Escape');
  }

  private async scanOpenDialog(name: string | RegExp): Promise<void> {
    await expect(this.page.getByRole('dialog', { name })).toBeVisible();
    await this.expectNoSeriousViolations();
  }
}
