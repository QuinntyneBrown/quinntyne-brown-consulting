import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TimeEntry } from '../models/time-entry';
import { TimeEntryDraft } from '../models/time-entry-draft';
import { ITimeEntryService } from './time-entry.service.interface';

@Injectable()
export class TimeEntryService implements ITimeEntryService {
  private readonly http = inject(HttpClient);

  log(draft: TimeEntryDraft): Promise<TimeEntry> {
    return firstValueFrom(this.http.post<TimeEntry>('/api/time-entries', draft));
  }

  update(id: string, draft: TimeEntryDraft): Promise<TimeEntry> {
    return firstValueFrom(this.http.put<TimeEntry>(`/api/time-entries/${id}`, draft));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/time-entries/${id}`));
  }
}
