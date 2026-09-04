import { expect, Locator, Page } from '@playwright/test';

export type Availability = 'Available' | 'Limited' | 'Unavailable';

export interface AssistantDetail {
  readonly name: string;
  readonly role: string;
  readonly specialties?: string;
  readonly availability?: Availability;
}

export class AssistantsPage {
  constructor(private readonly page: Page) {}

  async createAssistant(detail: AssistantDetail): Promise<void> {
    await this.openForm();
    const dialog = this.page.getByRole('dialog', { name: 'New assistant' });
    await this.fill(dialog, detail);
    await dialog.getByRole('button', { name: 'Save assistant' }).click();
    await this.expectAssistant(detail.name);
  }

  async updateAssistant(name: string, detail: AssistantDetail): Promise<void> {
    await this.card(name).getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Edit assistant' });
    await this.fill(dialog, detail);
    await dialog.getByRole('button', { name: 'Save assistant' }).click();
    await this.expectAssistant(detail.name);
  }

  /** A save the form refuses names every field that is still missing. */
  async expectSaveRejected(...fields: string[]): Promise<void> {
    await this.openForm();
    const dialog = this.page.getByRole('dialog', { name: 'New assistant' });
    await dialog.getByRole('button', { name: 'Save assistant' }).click();
    const alert = dialog.getByRole('alert');
    for (const field of fields) await expect(alert).toContainText(field);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  }

  async expectAssistant(name: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name })).toBeVisible();
  }

  async expectNoAssistant(name: string): Promise<void> {
    await expect(this.card(name)).toHaveCount(0);
  }

  async expectAssistantDetail(detail: AssistantDetail): Promise<void> {
    const card = this.card(detail.name);
    await expect(card).toContainText(detail.role);
    if (detail.specialties)
      for (const specialty of detail.specialties.split(',').map((item) => item.trim()))
        await expect(card).toContainText(specialty);
    if (detail.availability) await expect(card).toContainText(detail.availability.toLowerCase());
  }

  /** The card carries the work the assistant is carrying today. */
  async expectWorkload(name: string, stories: number, openTasks: number): Promise<void> {
    const card = this.card(name);
    await expect(card.locator('dl div').filter({ hasText: 'Stories' })).toContainText(
      String(stories),
    );
    await expect(card.locator('dl div').filter({ hasText: 'Open tasks' })).toContainText(
      String(openTasks),
    );
  }

  async deleteAssistant(name: string): Promise<void> {
    const card = this.card(name);
    await card.getByRole('button', { name: 'Delete', exact: true }).click();
    const confirmation = this.page.getByRole('dialog', { name: `Delete ${name}?` });
    await expect(confirmation).toContainText('permanently removed');
    await confirmation.getByRole('button', { name: 'Delete assistant' }).click();
    await expect(card).toHaveCount(0);
  }

  /** Deletion is refused, and every piece of blocking work is listed and reachable. */
  async expectGuardedDeletion(name: string, ...blockingLabels: string[]): Promise<void> {
    await this.card(name).getByRole('button', { name: 'Delete', exact: true }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Reassign work first' });
    for (const label of blockingLabels)
      await expect(dialog.getByText(label, { exact: true })).toBeVisible();
    await expect(this.card(name)).toBeVisible();
    await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();
  }

  /** Each listed assignment opens its story, so the work can be reassigned from there. */
  async openBlockingAssignment(name: string, storyKey: string): Promise<void> {
    await this.card(name).getByRole('button', { name: 'Delete', exact: true }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Reassign work first' });
    await dialog
      .getByRole('button', { name: new RegExp(`^${storyKey}\\b`) })
      .first()
      .click();
    await expect(
      this.page
        .getByRole('dialog')
        .filter({ has: this.page.getByRole('button', { name: 'Save story' }) }),
    ).toBeVisible();
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'No assistants yet' })).toBeVisible();
    await expect(
      this.page.locator('qbc-empty-state').getByRole('button', { name: 'New assistant' }),
    ).toBeVisible();
  }

  /** Availability is stated in words, not conveyed by colour alone. */
  async expectAvailabilityInWords(name: string, availability: Availability): Promise<void> {
    await expect(this.card(name).locator('qbc-availability')).toHaveText(
      availability.toLowerCase(),
    );
  }

  /** A pending save refuses a second submission until the first one settles. */
  async expectDuplicateSubmissionPrevented(detail: AssistantDetail): Promise<void> {
    await this.openForm();
    const dialog = this.page.getByRole('dialog', { name: 'New assistant' });
    await this.fill(dialog, detail);
    const save = dialog.getByRole('button', { name: 'Save assistant' });
    await save.click();
    await expect(save).toBeDisabled();
    await this.expectAssistant(detail.name);
    await expect(this.page.getByText('Assistant saved.')).toBeVisible();
  }

  async expectSaveFailureFeedback(name: string): Promise<void> {
    await this.page.route('**/api/assistants', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 503,
          contentType: 'application/problem+json',
          body: JSON.stringify({ detail: 'Assistant storage is temporarily unavailable.' }),
        });
      } else {
        await route.fallback();
      }
    });
    await this.openForm();
    const dialog = this.page.getByRole('dialog', { name: 'New assistant' });
    await this.fill(dialog, { name, role: 'Temporary role' });
    await dialog.getByRole('button', { name: 'Save assistant' }).click();
    await expect(this.page.getByRole('alert').first()).toContainText(
      'Assistant storage is temporarily unavailable.',
    );
    await expect(dialog).toBeVisible();
    await expect(this.card(name)).toHaveCount(0);
    await this.page.unroute('**/api/assistants');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  }

  /** The directory is still loading its records from the server. */
  async expectLoadingState(): Promise<void> {
    await expect(this.page.getByRole('status')).toContainText('Loading assistants…');
  }

  private async openForm(): Promise<void> {
    await this.page
      .getByRole('button', { name: /New assistant/ })
      .first()
      .click();
    await expect(this.page.getByRole('dialog', { name: 'New assistant' })).toBeVisible();
  }

  private async fill(dialog: Locator, detail: AssistantDetail): Promise<void> {
    await dialog.getByLabel('Full name *').fill(detail.name);
    await dialog.getByLabel('Role *').fill(detail.role);
    if (detail.specialties !== undefined)
      await dialog.getByLabel('Specialties').fill(detail.specialties);
    if (detail.availability)
      await dialog.getByLabel('Availability').selectOption({ label: detail.availability });
  }

  private card(name: string): Locator {
    return this.page.locator('.assistant-card').filter({ hasText: name });
  }
}
