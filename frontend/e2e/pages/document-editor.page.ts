import { expect, Locator, Page } from '@playwright/test';

export type DocumentView = 'Write' | 'Split' | 'Preview';

export type GuardChoice = 'Keep editing' | 'Discard changes' | 'Save and continue';

/**
 * The markdown document editor, which an initiative and an epic are both written on. What the
 * document says is observed through the rendered preview and the size report, which are the
 * surfaces a writer actually reads; the record around it belongs to the page object that extends
 * this one.
 */
export abstract class DocumentEditorPage {
  constructor(protected readonly page: Page) {}

  /** Names the record's own page element, its save button, and its screen-reader source label. */
  protected abstract readonly host: string;
  protected abstract readonly saveLabel: string;
  protected abstract readonly sourceLabel: string;
  protected abstract readonly saveStateLabel: string;

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

  /** The address of the record currently open, so a test can return to it directly. */
  currentAddress(): string {
    return new URL(this.page.url()).pathname;
  }

  async write(markdown: string): Promise<void> {
    await this.clear();
    if (markdown.length > 0) await this.page.keyboard.type(markdown);
  }

  /**
   * Puts the caret on the document's own lines before clearing it, rather than anywhere on the
   * surface: an empty document lays its empty state over the middle of the pane, and a click aimed
   * at the centre would reach that panel's template button instead of the document.
   */
  async clear(): Promise<void> {
    await this.documentLines().click({ position: { x: 8, y: 8 } });
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.press('Delete');
  }

  async selectWholeDocument(): Promise<void> {
    await this.editorSurface().click();
    await this.page.keyboard.press('ControlOrMeta+A');
  }

  async applyFormatting(command: string): Promise<void> {
    await this.formattingTools().getByRole('button', { name: command, exact: true }).click();
  }

  async show(view: DocumentView): Promise<void> {
    await this.viewSwitch().getByRole('button', { name: view }).click();
    await expect(this.viewSwitch().getByRole('button', { name: view })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }

  /** Exact, so a heading is not satisfied by another that merely contains its words. */
  async expectPreviewHeading(text: string): Promise<void> {
    await expect(this.preview().getByRole('heading', { name: text, exact: true })).toBeVisible();
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

  /** The reported size, which also shows whether the source survived a round trip. */
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
    await this.page.getByRole('button', { name: this.saveLabel }).click();
  }

  /**
   * A save the form refuses, which names every field that still needs a value. Whether the refused
   * draft holds unsaved work depends on what the writer had written, so each scenario says so
   * itself.
   */
  async saveExpectingRejection(...fields: string[]): Promise<void> {
    await this.save();
    const alert = this.page.getByRole('alert').first();
    for (const field of fields) await expect(alert).toContainText(field);
  }

  async discard(): Promise<void> {
    await this.page.getByRole('button', { name: 'Discard', exact: true }).click();
  }

  /** Leaves for another work area, which is what the unsaved-changes guard watches for. */
  async leaveForBacklog(): Promise<void> {
    await this.page.locator('qbc-nav-item').getByRole('link', { name: 'Backlog' }).click();
  }

  /** Leaves by the editor's own way back, which the unsaved-changes guard also watches. */
  async leaveForInitiatives(options: { guarded?: boolean } = {}): Promise<void> {
    await this.page.getByRole('link', { name: 'All initiatives' }).click();
    if (options.guarded === true) await this.chooseFromGuard('Discard changes');
    await expect(this.page.getByRole('heading', { name: 'Initiatives', level: 1 })).toBeVisible();
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

  /** The markdown source the code editor carries. */
  protected source(): Locator {
    return this.page.getByLabel(this.sourceLabel);
  }

  /** Where a writer clicks to put the caret in the document. */
  protected editorSurface(): Locator {
    return this.page.locator('app-markdown-editor');
  }

  /** The lines the document is written on, which is what a click has to land in to type. */
  protected documentLines(): Locator {
    return this.editorSurface().locator('.view-lines');
  }

  /** The record's own page element, so a field assertion is not answered by another page. */
  protected editorPage(): Locator {
    return this.page.locator(this.host);
  }

  private preview(): Locator {
    return this.page.locator('.document-preview');
  }

  private viewSwitch(): Locator {
    return this.page.getByRole('group', { name: 'Editor view' });
  }

  private formattingTools(): Locator {
    return this.page.getByRole('group', { name: 'Markdown formatting' });
  }

  private size(): Locator {
    return this.page.getByRole('status', { name: 'Document size' });
  }

  private saveState(): Locator {
    return this.page.getByRole('status', { name: this.saveStateLabel });
  }

  private guard(): Locator {
    return this.page.getByRole('dialog', { name: 'Keep your unsaved changes?' });
  }
}
