import { expect, Locator, Page } from '@playwright/test';

/**
 * Spelled out here rather than imported from the application, so that a regression in the
 * application's wording cannot travel into the assertion meant to catch it.
 */
function countOf(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export class HierarchyPage {
  constructor(private readonly page: Page) {}

  /** Returns to the hierarchy from the initiative editor, which is where a save lands. */
  async returnToHierarchy(): Promise<void> {
    await this.page.getByRole('link', { name: 'All initiatives' }).click();
    await expect(this.page.getByRole('heading', { name: 'Initiatives', level: 1 })).toBeVisible();
  }

  async expectInitiativeVisible(name: string): Promise<void> {
    await expect(this.initiative(name)).toBeVisible();
  }

  /** The card has one line for a whole brief, so it carries the brief's first line of prose. */
  async expectInitiativeSummarised(name: string, summary: string): Promise<void> {
    await expect(this.initiative(name)).toContainText(summary);
  }

  async expectInitiativeNotMarkdownSource(name: string, source: string): Promise<void> {
    await expect(this.initiative(name)).not.toContainText(source);
  }

  /** A row has one line for a whole summary, so it carries the summary's first line of prose. */
  async expectEpicSummarised(epicName: string, summary: string): Promise<void> {
    await expect(this.epic(epicName)).toContainText(summary);
  }

  async expectEpicNotMarkdownSource(epicName: string, source: string): Promise<void> {
    await expect(this.epic(epicName)).not.toContainText(source);
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
    await expect(this.initiative(name)).toContainText(
      `${countOf(epics, 'epic')} · ${countOf(stories, 'story', 'stories')}`,
    );
  }

  /** Asserts the roll-up verbatim, so the wording itself is under test rather than recomputed. */
  async expectInitiativeRollUpText(name: string, text: string): Promise<void> {
    await expect(this.initiative(name)).toContainText(text);
  }

  async expectEpicRollUpText(name: string, text: string): Promise<void> {
    await expect(this.epic(name)).toContainText(text);
  }

  async expectEpicRollUp(name: string, stories: number, percentage: number): Promise<void> {
    const row = this.epic(name);
    await expect(row).toContainText(countOf(stories, 'story', 'stories'));
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

  /** Starting an initiative opens its own page rather than a form beside the hierarchy. */
  async expectNewInitiativeOpensTheEditor(): Promise<void> {
    await this.page
      .locator('qbc-empty-state')
      .getByRole('button', { name: 'New initiative' })
      .click();
    await expect(this.page.getByRole('heading', { name: 'New initiative' })).toBeVisible();
    await expect(this.page).toHaveURL(/\/initiatives\/new$/);
  }

  async expectNoEpicsMessage(initiativeName: string): Promise<void> {
    await expect(this.initiative(initiativeName)).toContainText('No epics yet');
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
