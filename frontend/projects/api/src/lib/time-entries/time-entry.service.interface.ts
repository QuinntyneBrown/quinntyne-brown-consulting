import { TimeEntry } from '../models/time-entry';
import { TimeEntryDraft } from '../models/time-entry-draft';

export interface ITimeEntryService {
  log(draft: TimeEntryDraft): Promise<TimeEntry>;
  update(id: string, draft: TimeEntryDraft): Promise<TimeEntry>;
  delete(id: string): Promise<void>;
}
