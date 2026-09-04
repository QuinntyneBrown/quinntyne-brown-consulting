import { Component, effect, inject, input, viewChild } from '@angular/core';
import { Attachment, WorkItemKind } from '@qbc/api';
import {
  ButtonComponent,
  ConfirmDialogComponent,
  EmptyStateComponent,
  FileDropComponent,
  LoadingStateComponent,
  PillComponent,
  SectionLabelComponent,
} from '@qbc/components';
import { ATTACHMENTS_SERVICE } from './attachments.service.contract';

/**
 * The files on one work item. An initiative, an epic, and a story each take the same list, so the
 * panel is written once and given the work item it is reading rather than routed to its own page.
 */
@Component({
  selector: 'app-attachments-panel',
  imports: [
    ButtonComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    FileDropComponent,
    LoadingStateComponent,
    PillComponent,
    SectionLabelComponent,
  ],
  templateUrl: './attachments-panel.component.html',
  styleUrl: './attachments-panel.component.scss',
})
export class AttachmentsPanelComponent {
  private readonly service = inject(ATTACHMENTS_SERVICE);
  private readonly confirm = viewChild.required(ConfirmDialogComponent);

  readonly workItemKind = input.required<WorkItemKind>();
  readonly workItemId = input.required<string>();

  readonly attachments = this.service.attachments;
  readonly loadingState = this.service.loadingState;

  readonly hint = 'Up to 25 MB per file. Programs and folders are not accepted.';

  constructor() {
    // The panel follows whichever work item it is given, so switching stories re-reads the list.
    effect(() => {
      const id = this.workItemId();
      if (id) void this.service.load(this.workItemKind(), id);
    });
  }

  /** Whole kilobytes, and one decimal once a file is measured in megabytes. */
  size(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /** The extension is the part of a file name someone actually reads at a glance. */
  extension(fileName: string): string {
    const dot = fileName.lastIndexOf('.');
    return dot > 0 ? fileName.slice(dot + 1).toUpperCase() : 'FILE';
  }

  attachedOn(value: string): string {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  async attach(files: readonly File[]): Promise<void> {
    for (const file of files) {
      await this.service.upload(this.workItemKind(), this.workItemId(), file, null);
    }
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
}
