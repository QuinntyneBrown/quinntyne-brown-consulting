import { expect, Locator } from '@playwright/test';
import { DocumentEditorPage } from './document-editor.page';

/**
 * The initiative editor: the one surface an initiative's name and outcome brief are written on.
 * Everything about writing the markdown itself lives in {@link DocumentEditorPage}, which the epic
 * editor shares.
 */
export class InitiativeBriefPage extends DocumentEditorPage {
  protected readonly host = 'app-initiative-brief-page';
  protected readonly saveLabel = 'Save initiative';
  protected readonly sourceLabel = 'Initiative brief, markdown source';
  protected readonly saveStateLabel = 'Brief save state';

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

  async openAddress(address: string): Promise<void> {
    await this.page.goto(address);
    await this.expectOpen();
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

  async expectName(name: string): Promise<void> {
    await expect(this.nameField()).toHaveValue(name);
  }

  async renameTo(name: string): Promise<void> {
    await this.nameField().fill(name);
  }

  async writeBrief(markdown: string): Promise<void> {
    await this.write(markdown);
  }

  async clearBrief(): Promise<void> {
    await this.clear();
  }

  async selectWholeBrief(): Promise<void> {
    await this.selectWholeDocument();
  }

  async acceptTheEmptyBriefTemplate(): Promise<void> {
    await this.page.getByRole('button', { name: 'Insert the outcome brief template' }).click();
  }

  async expectEmptyBriefGuidance(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'This brief is empty' })).toBeVisible();
  }

  private nameField(): Locator {
    return this.page.getByLabel('Initiative name *');
  }
}
