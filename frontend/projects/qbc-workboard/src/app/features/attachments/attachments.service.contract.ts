import { InjectionToken, Signal } from '@angular/core';
import { Attachment, WorkItemKind } from '@qbc/api';
import { LoadingState } from '../../models/loading-state';

export interface IAttachmentsService {
  /** The files on the work item currently on screen, as the server last reported them. */
  readonly attachments: Signal<readonly Attachment[]>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(kind: WorkItemKind, workItemId: string): Promise<void>;
  upload(
    kind: WorkItemKind,
    workItemId: string,
    file: File,
    assistantId: string | null,
  ): Promise<boolean>;
  download(id: string): Promise<void>;
  delete(id: string, kind: WorkItemKind, workItemId: string): Promise<boolean>;
}

export const ATTACHMENTS_SERVICE = new InjectionToken<IAttachmentsService>('ATTACHMENTS_SERVICE');
