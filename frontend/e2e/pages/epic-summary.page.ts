import { expect, Locator } from '@playwright/test';
import { DocumentEditorPage } from './document-editor.page';

/**
 * The epic editor: the one surface an epic's parent, name, and markdown summary are written on. It
 * is the initiative editor with one more field, so everything about writing the markdown comes from
 * {@link DocumentEditorPage}.
 */
export class EpicSummaryPage extends DocumentEditorPage {
  protected readonly host = 'app-epic-summary-page';
  protected readonly saveLabel = 'Save epic';
  protected readonly sourceLabel = 'Epic summary, markdown source';
  protected readonly saveStateLabel = 'Summary save state';

  /** Opens an epic the way a reader reaches it: from its row in the hierarchy. */
  async openFrom(epicName: string): Promise<void> {
    await this.page
      .locator('.epic-row')
      .filter({ hasText: epicName })
      .getByRole('button', { name: 'Edit', exact: true })
      .click();
    await this.expectOpen();
  }

  /** Starts an epic in the context of an initiative, which is the only way one is created. */
  async startNewUnder(initiativeName: string): Promise<void> {
    await this.page
      .locator('.initiative-card')
      .filter({ hasText: initiativeName })
      .locator('article > header')
      .getByRole('button', { name: /Epic/ })
      .click();
    await this.expectOpen('New epic');
  }

  async expectOpen(title = 'Edit epic'): Promise<void> {
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
    await expect(this.editorSurface()).toBeVisible();
    // The code editor keeps its input off-screen, so its presence is what identifies it.
    await expect(this.source()).toBeAttached();
  }

  async openAddress(address: string): Promise<void> {
    await this.page.goto(address);
    await this.expectOpen();
  }

  /** A whole epic written on one surface. */
  async writeEpic(name: string, markdown: string): Promise<void> {
    await this.renameTo(name);
    await this.write(markdown);
    await this.save();
  }

  async expectName(name: string): Promise<void> {
    await expect(this.nameField()).toHaveValue(name);
  }

  async renameTo(name: string): Promise<void> {
    await this.nameField().fill(name);
  }

  /** The parent an epic belongs to, which it can be moved between. */
  async expectInitiative(initiativeName: string): Promise<void> {
    await expect(this.initiativeField().locator('option:checked')).toHaveText(initiativeName);
  }

  async chooseInitiative(initiativeName: string): Promise<void> {
    await this.initiativeField().selectOption({ label: initiativeName });
  }

  /** The summary is markdown, so the editor offers no plain-text field to write it in. */
  async expectNoPlainSummaryField(): Promise<void> {
    await expect(this.page.getByLabel('Summary *')).toHaveCount(0);
    await expect(this.editorPage().locator('qbc-textarea')).toHaveCount(0);
  }

  async expectEmptySummaryGuidance(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'This summary is empty' })).toBeVisible();
  }

  /** An epic has no house shape, so the empty state offers nothing to insert. */
  async expectNoTemplateOffered(): Promise<void> {
    await expect(this.page.getByRole('button', { name: /Insert the/ })).toHaveCount(0);
  }

  private nameField(): Locator {
    return this.page.getByLabel('Epic name *');
  }

  private initiativeField(): Locator {
    return this.page.getByLabel('Initiative *');
  }
}
