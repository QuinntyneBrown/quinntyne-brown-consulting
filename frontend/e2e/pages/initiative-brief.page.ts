import { expect, Locator, Page } from '@playwright/test';

export type BriefView = 'Write' | 'Split' | 'Preview';

export type GuardChoice = 'Keep editing' | 'Discard changes' | 'Save and continue';

/**
 * The initiative editor: the one surface an initiative's name and outcome brief are written on.
 * What the brief says is observed through the rendered preview and the size report, which are the
 * surfaces a writer actually reads.
 */
export class InitiativeBriefPage {
  constructor(private readonly page: Page) {}

  /** Opens an initiative the way a reader reaches it: from the hierarchy. */
  async openFrom(initiativeName: string, options: { editorLoads?: boolean } = {}): Promise<void> {
    await this.page
      .locator('.initiative-card')
      .filter({ hasText: initiativeName })
      .locator('article > header')
      .getByRole('button', { name: 'Edit', exact: true })
      .click();
    if (options.editorLoads === false) {
      await expect(this.page.getByRole('heading', { name: 'Edit initiative' })).toBeVisible();
      return;
    }
    await this.expectOpen();
  }

  /**
   * Withholds the stylesheet the code editor is only created once it has, which is the observable
   * way an editor that cannot be loaded is produced.
   */
  async blockTheEditorStylesheet(): Promise<void> {
    await this.page.route('**/monaco-editor.css', (route) => route.abort());
  }

  async expectEditorUnavailable(): Promise<void> {
    await expect(
      this.page.getByRole('alert').filter({ hasText: 'could not be loaded' }),
    ).toBeVisible();
    await expect(this.source()).toHaveCount(0);
  }

  /** Starts an initiative from the hierarchy, which lands on the same editor with nothing saved. */
  async startNew(): Promise<void> {
    await this.page
      .getByRole('button', { name: /New initiative/ })
      .first()
      .click();
    await this.expectOpen('New initiative');
  }

  async expectOpen(title = 'Edit initiative'): Promise<void> {
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
    await expect(this.editorSurface()).toBeVisible();
    // The code editor keeps its input off-screen, so its presence is what identifies it.
    await expect(this.source()).toBeAttached();
  }

  /** A whole initiative written on one surface, which is the only way one is created. */
  async writeInitiative(name: string, markdown: string): Promise<void> {
    await this.renameTo(name);
    await this.writeBrief(markdown);
    await this.save();
  }

  /** The brief is markdown, so the editor offers no plain-text field to write it in. */
  async expectNoPlainDescriptionField(): Promise<void> {
    await expect(this.page.getByLabel('Outcome description *')).toHaveCount(0);
    await expect(this.editorPage().locator('qbc-textarea')).toHaveCount(0);
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
    await this.page.getByRole('button', { name: 'Save initiative' }).click();
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

  /** Leaves the editor by its own way back, which the unsaved-changes guard also watches. */
  async leaveForInitiatives(options: { guarded?: boolean } = {}): Promise<void> {
    await this.page.getByRole('link', { name: 'All initiatives' }).click();
    if (options.guarded === true) await this.chooseFromGuard('Discard changes');
    await expect(this.page.getByRole('heading', { name: 'Initiatives', level: 1 })).toBeVisible();
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

  private editorPage(): Locator {
    return this.page.locator('app-initiative-brief-page');
  }

  private nameField(): Locator {
    return this.page.getByLabel('Initiative name *');
  }

  /** The markdown source the code editor carries. */
  private source(): Locator {
    return this.page.getByLabel('Initiative brief, markdown source');
  }

  /** Where a writer clicks to put the caret in the brief. */
  private editorSurface(): Locator {
    return this.page.locator('app-brief-editor');
  }

  private preview(): Locator {
    return this.page.locator('.brief-preview');
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
