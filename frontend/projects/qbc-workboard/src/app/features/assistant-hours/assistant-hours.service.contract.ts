import { InjectionToken, Signal } from '@angular/core';
import { AssistantHours, Story, TimeEntryDraft } from '@qbc/api';
import { LoadingState } from '../../models/loading-state';

export interface IAssistantHoursService {
  /** The assistant whose hours are on screen, as they were last read from the server. */
  readonly hours: Signal<AssistantHours | null>;
  /** The stories time can be logged against: everything that has not been archived. */
  readonly stories: Signal<readonly Story[]>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(assistantId: string): Promise<void>;
  log(draft: TimeEntryDraft): Promise<boolean>;
  update(entryId: string, draft: TimeEntryDraft): Promise<boolean>;
  delete(entryId: string, assistantId: string): Promise<boolean>;
}

export const ASSISTANT_HOURS_SERVICE = new InjectionToken<IAssistantHoursService>(
  'ASSISTANT_HOURS_SERVICE',
);
