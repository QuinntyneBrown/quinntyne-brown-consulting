import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { Attachment, WorkItemKind } from '@qbc/api';
import {
  ButtonComponent,
  ConfirmDialogComponent,
  FileDropComponent,
  IconButtonComponent,
  IconComponent,
  LoadingStateComponent,
  SectionLabelComponent,
  pluralize,
} from '@qbc/components';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { badgeOf, formatSize, kindOf, refusalFor } from './attachment-rules';
import { ATTACHMENTS_SERVICE } from './attachments.service.contract';

/**
 * A file on its way to the server, or one the server turned away. Neither is an attachment yet,
 * so neither lives in the service's list; the panel keeps them beside it until they resolve.
 */
interface PendingUpload {
  readonly id: number;
  readonly file: File;
  readonly status: 'uploading' | 'failed';
  readonly error: string | null;
}

/**
 * The files on one work item. An initiative, an epic, and a story each take the same list, so the
 * panel is written once and given the work item it is reading rather than routed to its own page.
 */
@Component({
  selector: 'app-attachments-panel',
  imports: [
    ButtonComponent,
    ConfirmDialogComponent,
    FileDropComponent,
    IconButtonComponent,
    IconComponent,
    LoadingStateComponent,
    SectionLabelComponent,
  ],
  templateUrl: './attachments-panel.component.html',
  styleUrl: './attachments-panel.component.scss',
})
export class AttachmentsPanelComponent {
  private static nextUploadId = 1;

  private readonly service = inject(ATTACHMENTS_SERVICE);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly confirm = viewChild.required(ConfirmDialogComponent);
  private readonly uploadsValue = signal<readonly PendingUpload[]>([]);

  readonly workItemKind = input.required<WorkItemKind>();
  readonly workItemId = input.required<string>();

  readonly attachments = this.service.attachments;
  readonly loadingState = this.service.loadingState;
  readonly uploads = this.uploadsValue.asReadonly();

  /** The zone only needs to be tall when there is nothing else in the section to look at. */
  readonly isEmpty = computed(() => this.attachments().length === 0 && this.uploads().length === 0);

  readonly summary = computed(() => {
    const files = this.attachments();
    if (files.length === 0) return '';
    const total = files.reduce((sum, file) => sum + file.sizeInBytes, 0);
    return `${pluralize(files.length, 'file')} · ${formatSize(total)}`;
  });

  readonly hint = 'Up to 25 MB per file. Programs and folders are not accepted.';
  readonly emptySubtitle =
    'Drop the brief, the diagram, or the export that explains this work, and whoever picks it up next will find it here. Up to 25 MB per file; programs and folders are not accepted.';

  constructor() {
    // The panel follows whichever work item it is given, so switching stories re-reads the list
    // and leaves behind anything still pending for the last one.
    effect(() => {
      const id = this.workItemId();
      this.uploadsValue.set([]);
      if (id) void this.service.load(this.workItemKind(), id);
    });
  }

  size(bytes: number): string {
    return formatSize(bytes);
  }

  badge(fileName: string, contentType = ''): string {
    return badgeOf(fileName, contentType);
  }

  kind(fileName: string, contentType = ''): string {
    return kindOf(fileName, contentType);
  }

  attachedOn(value: string): string {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Every file is shown at once, as uploading or already refused, and the uploads run together
   * rather than one behind the other so a large file does not hold a small one back.
   */
  async attach(files: readonly File[]): Promise<void> {
    const kind = this.workItemKind();
    const workItemId = this.workItemId();
    const started: PendingUpload[] = [];

    for (const file of files) {
      const refusal = refusalFor(file);
      const pending: PendingUpload = {
        id: AttachmentsPanelComponent.nextUploadId++,
        file,
        status: refusal ? 'failed' : 'uploading',
        error: refusal,
      };
      this.uploadsValue.update((list) => [...list, pending]);
      if (refusal) {
        this.feedback.show(refusal, 'error');
      } else {
        started.push(pending);
      }
    }

    await Promise.all(started.map((pending) => this.send(pending, kind, workItemId)));
  }

  async retry(upload: PendingUpload): Promise<void> {
    const refusal = refusalFor(upload.file);
    if (refusal) {
      this.feedback.show(refusal, 'error');
      return;
    }
    this.uploadsValue.update((list) =>
      list.map((item) =>
        item.id === upload.id ? { ...item, status: 'uploading', error: null } : item,
      ),
    );
    await this.send(upload, this.workItemKind(), this.workItemId());
  }

  dismiss(upload: PendingUpload): void {
    this.uploadsValue.update((list) => list.filter((item) => item.id !== upload.id));
  }

  download(attachment: Attachment): Promise<void> {
    return this.service.download(attachment.id);
  }

  async remove(attachment: Attachment): Promise<void> {
    const confirmed = await this.confirm().open(
      'Remove this file?',
      `${attachment.fileName} (${this.size(attachment.sizeInBytes)}) will no longer be attached to this work item.`,
      'Remove',
    );

    if (confirmed) {
      await this.service.delete(attachment.id, this.workItemKind(), this.workItemId());
    }
  }

  private async send(
    pending: PendingUpload,
    kind: WorkItemKind,
    workItemId: string,
  ): Promise<void> {
    const result = await this.service.upload(kind, workItemId, pending.file, null);
    // The work item may have changed underneath a slow upload; a stale result is simply dropped.
    if (this.workItemId() !== workItemId) return;

    if (result.ok) {
      this.dismiss(pending);
    } else {
      this.uploadsValue.update((list) =>
        list.map((item) =>
          item.id === pending.id ? { ...item, status: 'failed', error: result.message } : item,
        ),
      );
    }
  }
}
