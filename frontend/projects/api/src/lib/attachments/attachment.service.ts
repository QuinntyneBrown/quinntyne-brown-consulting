import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Attachment } from '../models/attachment';
import { AttachmentDraft } from '../models/attachment-draft';
import { WorkItemKind } from '../models/work-item-kind';
import { IAttachmentService } from './attachment.service.interface';

@Injectable()
export class AttachmentService implements IAttachmentService {
  private readonly http = inject(HttpClient);

  getForWorkItem(kind: WorkItemKind, workItemId: string): Promise<Attachment[]> {
    return firstValueFrom(
      this.http.get<Attachment[]>('/api/attachments', {
        params: { workItemKind: kind, workItemId },
      }),
    );
  }

  /**
   * The one request in this library that is not JSON. A file has to travel as multipart, and the
   * bearer token still arrives through the same interceptor every other call uses.
   */
  upload(draft: AttachmentDraft): Promise<Attachment> {
    const form = new FormData();
    form.append('file', draft.file, draft.file.name);
    form.append('workItemKind', draft.workItemKind);
    form.append('workItemId', draft.workItemId);
    if (draft.uploadedByAssistantId) {
      form.append('uploadedByAssistantId', draft.uploadedByAssistantId);
    }

    return firstValueFrom(this.http.post<Attachment>('/api/attachments', form));
  }

  download(id: string): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`/api/attachments/${id}/content`, { responseType: 'blob' }),
    );
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/attachments/${id}`));
  }
}
