import { expect, Locator, Page } from '@playwright/test';

export type BriefView = 'Write' | 'Split' | 'Preview';

export type GuardChoice = 'Keep editing' | 'Discard changes' | 'Save and continue';

/**
 * The initiative outcome brief editor. Markdown source is typed through whichever editor the page
 * loaded, and what the brief says is observed through the rendered preview, the outline, and the
 * size report, which are the surfaces a writer actually reads.
 */
export class InitiativeBriefPage {
  constructor(private readonly page: Page) {}

  /** Opens the brief the way a reader reaches it: from the initiative in the hierarchy. */
  async openFrom(initiativeName: string): Promise<void> {
    await this.page
      .locator('.initiative-card')
      .filter({ hasText: initiativeName })
      .getByRole('button', { name: 'Edit brief' })
      .click();
    await this.expectOpen();
  }

  async expectOpen(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Edit initiative brief' })).toBeVisible();
    await expect(this.editorSurface()).toBeVisible();
    // The code editor keeps its input off-screen, so its presence is what identifies it.
    await expect(this.source()).toBeAttached();
  }

  /** The address of the brief currently open, so a test can return to it directly. */
  currentAddress(): string {
    return new URL(this.page.url()).pathname;
  }

  async openAddress(address: string): Promise<void> {
    await this.page.goto(address);
    await this.expectOpen();
  }

  async expectName(name: string): Promise<void> {
    await expect(this.nameField()).toHaveValue(name);
  }

  async renameTo(name: string): Promise<void> {
    await this.nameField().fill(name);
  }

  async writeBrief(markdown: string): Promise<void> {
    await this.clearBrief();
    if (markdown.length > 0) await this.page.keyboard.type(markdown);
  }

  async clearBrief(): Promise<void> {
    await this.editorSurface().click();
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.press('Delete');
  }

  async selectWholeBrief(): Promise<void> {
    await this.editorSurface().click();
    await this.page.keyboard.press('ControlOrMeta+A');
  }

  async applyFormatting(command: string): Promise<void> {
    await this.formattingTools().getByRole('button', { name: command, exact: true }).click();
  }

  async insertBuildingBlock(label: string): Promise<void> {
    await this.page.getByLabel('Insert a building block').selectOption({ label });
  }

  async acceptTheEmptyBriefTemplate(): Promise<void> {
    await this.page.getByRole('button', { name: 'Insert the outcome brief template' }).click();
  }

  async expectEmptyBriefGuidance(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'This brief is empty' })).toBeVisible();
  }

  async show(view: BriefView): Promise<void> {
    await this.viewSwitch().getByRole('button', { name: view }).click();
    await expect(this.viewSwitch().getByRole('button', { name: view })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }

  async expectPreviewHeading(text: string): Promise<void> {
    await expect(this.preview().getByRole('heading', { name: text })).toBeVisible();
  }

  async expectPreviewEmphasises(text: string): Promise<void> {
    await expect(this.preview().locator('strong').filter({ hasText: text })).toBeVisible();
  }

  async expectPreviewHasNoEmphasis(): Promise<void> {
    await expect(this.preview().locator('strong')).toHaveCount(0);
  }

  async expectPreviewTableRow(...cells: string[]): Promise<void> {
    const row = this.preview().getByRole('row').filter({ hasText: cells[0] });
    for (const cell of cells) await expect(row).toContainText(cell);
  }

  async expectPreviewTaskList(done: string, outstanding: string): Promise<void> {
    const tasks = this.preview().locator('.task-list');
    await expect(tasks).toContainText(done);
    await expect(tasks).toContainText(outstanding);
  }

  async expectPreviewCodeBlock(text: string): Promise<void> {
    await expect(this.preview().locator('pre code')).toContainText(text);
  }

  async expectPreviewNestedItem(text: string): Promise<void> {
    await expect(this.preview().locator('li li')).toContainText(text);
  }

  async expectPreviewText(text: string): Promise<void> {
    await expect(this.preview()).toContainText(text);
  }

  async selectOutlineHeading(text: string): Promise<void> {
    await this.outline().getByRole('button', { name: text, exact: true }).click();
  }

  async expectOutlineLists(...headings: string[]): Promise<void> {
    for (const heading of headings) {
      await expect(
        this.outline().getByRole('button', { name: heading, exact: true }),
      ).toBeVisible();
    }
  }

  async expectCurrentOutlineHeading(text: string): Promise<void> {
    await expect(this.outline().locator('li.is-current')).toContainText(text);
  }

  /** The reported size of the brief, which also shows whether its source survived a round trip. */
  async expectSize(words: number, characters: number): Promise<void> {
    await expect(this.size()).toContainText(`${words.toLocaleString('en-US')} words`);
    await expect(this.size()).toContainText(`${characters.toLocaleString('en-US')} characters`);
  }

  async expectCharacterCount(characters: number): Promise<void> {
    await expect(this.size()).toContainText(`${characters.toLocaleString('en-US')} characters`);
  }

  async expectUnsavedChanges(): Promise<void> {
    await expect(this.saveState()).toContainText('Unsaved changes');
  }

  async expectSaved(): Promise<void> {
    await expect(this.saveState()).toContainText('Saved');
  }

  async save(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save brief' }).click();
  }

  async saveExpectingRejection(...fields: string[]): Promise<void> {
    await this.save();
    const alert = this.page.getByRole('alert').first();
    for (const field of fields) await expect(alert).toContainText(field);
    await this.expectUnsavedChanges();
  }

  async discard(): Promise<void> {
    await this.page.getByRole('button', { name: 'Discard', exact: true }).click();
  }

  /** Leaves the brief for another work area, which is what the unsaved-changes guard watches for. */
  async leaveForBacklog(): Promise<void> {
    await this.page.locator('qbc-nav-item').getByRole('link', { name: 'Backlog' }).click();
  }

  async expectGuardOffersEveryChoice(): Promise<void> {
    await expect(this.guard()).toBeVisible();
    const choices: GuardChoice[] = ['Keep editing', 'Discard changes', 'Save and continue'];
    for (const choice of choices) {
      await expect(this.guard().getByRole('button', { name: choice })).toBeVisible();
    }
  }

  async chooseFromGuard(choice: GuardChoice): Promise<void> {
    await this.guard().getByRole('button', { name: choice }).click();
    await expect(this.guard()).toBeHidden();
  }

  async expectLeftForBacklog(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Backlog', level: 1 })).toBeVisible();
  }

  private nameField(): Locator {
    return this.page.getByLabel('Initiative name *');
  }

  /** The markdown source, whichever editor the page managed to load. */
  private source(): Locator {
    return this.page.getByLabel('Initiative brief, markdown source');
  }

  /** Where a writer clicks to put the caret in the brief, in either editor. */
  private editorSurface(): Locator {
    return this.page.locator('app-brief-editor');
  }

  private preview(): Locator {
    return this.page.locator('.brief-preview');
  }

  private outline(): Locator {
    return this.page.getByRole('navigation', { name: 'Brief outline' });
  }

  private viewSwitch(): Locator {
    return this.page.getByRole('group', { name: 'Editor view' });
  }

  private formattingTools(): Locator {
    return this.page.getByRole('group', { name: 'Markdown formatting' });
  }

  private size(): Locator {
    return this.page.getByRole('status', { name: 'Brief size' });
  }

  private saveState(): Locator {
    return this.page.getByRole('status', { name: 'Brief save state' });
  }

  private guard(): Locator {
    return this.page.getByRole('dialog', { name: 'Keep your unsaved changes?' });
  }
}
