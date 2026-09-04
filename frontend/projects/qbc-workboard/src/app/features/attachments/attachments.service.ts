import { Injectable, inject, signal } from '@angular/core';
import { ATTACHMENT_SERVICE, Attachment, WorkItemKind, presentApiError } from '@qbc/api';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { IAttachmentsService } from './attachments.service.contract';

/**
 * Reads and writes the files on one work item. Every write is followed by a fresh read, so the list
 * on screen is the server's and never a local guess at what the server would have said.
 */
@Injectable({ providedIn: 'root' })
export class AttachmentsService implements IAttachmentsService {
  private readonly attachmentService = inject(ATTACHMENT_SERVICE);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly attachmentsValue = signal<readonly Attachment[]>([]);
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly attachments = this.attachmentsValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();

  async load(kind: WorkItemKind, workItemId: string): Promise<void> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      this.attachmentsValue.set(await this.attachmentService.getForWorkItem(kind, workItemId));
      this.loadingValue.set('loaded');
    } catch (error) {
      this.fail(error);
    }
  }

  async upload(
    kind: WorkItemKind,
    workItemId: string,
    file: File,
    assistantId: string | null,
  ): Promise<boolean> {
    this.errorValue.set(null);
    try {
      await this.attachmentService.upload({
        workItemKind: kind,
        workItemId,
        file,
        uploadedByAssistantId: assistantId,
      });
      await this.load(kind, workItemId);
      this.feedback.show(`${file.name} attached.`);
      return true;
    } catch (error) {
      // A refusal leaves the existing list exactly as it was; only the reason is new.
      this.announce(error);
      return false;
    }
  }

  async download(id: string): Promise<void> {
    const attachment = this.attachmentsValue().find((item) => item.id === id);
    if (!attachment) return;

    try {
      const blob = await this.attachmentService.download(id);
      // The workspace is behind a bearer token, so a plain link cannot fetch the file. The bytes
      // are read here and handed to the browser under the name the file was attached with.
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      this.announce(error);
    }
  }

  async delete(id: string, kind: WorkItemKind, workItemId: string): Promise<boolean> {
    try {
      await this.attachmentService.delete(id);
      await this.load(kind, workItemId);
      return true;
    } catch (error) {
      this.announce(error);
      return false;
    }
  }

  private announce(error: unknown): void {
    const message = presentApiError(error);
    this.errorValue.set(message);
    this.feedback.show(message, 'error');
  }

  private fail(error: unknown): void {
    this.announce(error);
    this.loadingValue.set('failed');
  }
}
