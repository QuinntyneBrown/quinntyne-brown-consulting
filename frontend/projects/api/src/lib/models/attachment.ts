import { WorkItemKind } from './work-item-kind';

export interface Attachment {
  readonly id: string;
  readonly workItemKind: WorkItemKind;
  readonly workItemId: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeInBytes: number;
  /** Null when the file was attached without an assistant named; `L1-013` infers nobody. */
  readonly uploadedByAssistantId: string | null;
  readonly uploadedBy: string | null;
  readonly uploadedOn: string;
}
