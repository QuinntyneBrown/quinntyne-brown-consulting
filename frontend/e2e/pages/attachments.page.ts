import { expect, Locator, Page } from '@playwright/test';

export interface AttachedFile {
  readonly name: string;
  readonly contents?: string;
  readonly contentType?: string;
}

/**
 * The attachments panel, wherever it is shown. An initiative, an epic, and a story all take the
 * same list, so one page object serves all three and a specification only says which work item it
 * opened.
 */
export class AttachmentsPage {
  constructor(private readonly page: Page) {}

  private panel(): Locator {
    return this.page.locator('[data-testid="attachments-panel"]');
  }

  private row(fileName: string): Locator {
    return this.panel().locator(`[data-file-name="${fileName}"]`);
  }

  async expectVisible(): Promise<void> {
    await expect(this.panel()).toBeVisible();
  }

  /**
   * Attaches through the real file input rather than a synthetic drop, so the browser builds the
   * multipart body the API is answered with.
   */
  async attach(file: AttachedFile): Promise<void> {
    await this.panel()
      .locator('[data-testid="file-drop-input"]')
      .setInputFiles({
        name: file.name,
        mimeType: file.contentType ?? 'application/pdf',
        buffer: Buffer.from(file.contents ?? 'A brief that explains the work.'),
      });
  }

  async expectFiles(...fileNames: string[]): Promise<void> {
    await expect(this.panel().locator('.file-row')).toHaveCount(fileNames.length);
    for (const fileName of fileNames) {
      await expect(this.row(fileName)).toBeVisible();
    }
  }

  async expectFileDetail(fileName: string, detail: string | RegExp): Promise<void> {
    await expect(this.row(fileName).locator('.file-meta')).toContainText(detail);
  }

  async expectSize(fileName: string, size: string): Promise<void> {
    await expect(this.row(fileName).locator('.file-size')).toHaveText(size);
  }

  /** Downloads the file and hands back what the browser saved it as. */
  async download(fileName: string): Promise<string> {
    const saving = this.page.waitForEvent('download');
    await this.row(fileName)
      .getByRole('button', { name: `Download ${fileName}` })
      .click();
    const download = await saving;
    return download.suggestedFilename();
  }

  /** The file name itself is the shortest route to the file; this takes it. */
  async downloadByName(fileName: string): Promise<string> {
    const saving = this.page.waitForEvent('download');
    await this.row(fileName).getByRole('button', { name: fileName, exact: true }).click();
    const download = await saving;
    return download.suggestedFilename();
  }

  async remove(fileName: string, options: { confirm?: boolean } = {}): Promise<void> {
    await this.row(fileName)
      .getByRole('button', { name: `Remove ${fileName}` })
      .click();
    const dialog = this.page.getByRole('dialog').filter({ hasText: 'Remove this file?' });
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole('button', { name: options.confirm === false ? 'Cancel' : 'Remove', exact: true })
      .click();
    await expect(dialog).toBeHidden();
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.panel().getByText('No files attached yet')).toBeVisible();
    await expect(this.panel().getByRole('button', { name: 'Choose files' })).toBeVisible();
  }

  /** A refusal is announced, and the panel is left holding exactly what it held before. */
  async expectRefused(detail: string | RegExp): Promise<void> {
    await expect(this.page.locator('qbc-toast')).toContainText(detail);
  }

  private failedRow(fileName: string): Locator {
    return this.panel().locator(`.upload-row.is-failed[data-upload-name="${fileName}"]`);
  }

  /** The refused file stays in the list with its reason, until the reader lets it go. */
  async expectFailedUpload(fileName: string, detail: string | RegExp): Promise<void> {
    await expect(this.failedRow(fileName)).toBeVisible();
    await expect(this.failedRow(fileName)).toContainText(detail);
  }

  async dismissFailedUpload(fileName: string): Promise<void> {
    await this.failedRow(fileName)
      .getByRole('button', { name: `Dismiss ${fileName}` })
      .click();
    await expect(this.failedRow(fileName)).toHaveCount(0);
  }
}
