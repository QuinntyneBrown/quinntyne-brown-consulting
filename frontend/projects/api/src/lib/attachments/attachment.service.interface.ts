import { Attachment } from '../models/attachment';
import { AttachmentDraft } from '../models/attachment-draft';
import { WorkItemKind } from '../models/work-item-kind';

export interface IAttachmentService {
  getForWorkItem(kind: WorkItemKind, workItemId: string): Promise<Attachment[]>;
  upload(draft: AttachmentDraft): Promise<Attachment>;
  download(id: string): Promise<Blob>;
  delete(id: string): Promise<void>;
}
