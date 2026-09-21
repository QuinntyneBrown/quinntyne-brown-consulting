import { TimeEntry } from '../models/time-entry';
import { TimeEntryBatchDraft } from '../models/time-entry-batch-draft';
import { TimeEntryDraft } from '../models/time-entry-draft';

export interface ITimeEntryService {
  log(draft: TimeEntryDraft): Promise<TimeEntry>;
  /** One entry per story, in the order the draft named them. */
  logBatch(draft: TimeEntryBatchDraft): Promise<readonly TimeEntry[]>;
  update(id: string, draft: TimeEntryDraft): Promise<TimeEntry>;
  delete(id: string): Promise<void>;
}
