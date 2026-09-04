import { WorkItemKind } from './work-item-kind';

export interface AttachmentDraft {
  readonly workItemKind: WorkItemKind;
  readonly workItemId: string;
  readonly file: File;
  readonly uploadedByAssistantId: string | null;
}
