import { Injectable, inject, signal } from '@angular/core';
import {
  ASSISTANT_SERVICE,
  AssistantHours,
  STORY_SERVICE,
  Story,
  TIME_ENTRY_SERVICE,
  TimeEntryDraft,
  presentApiError,
} from '@qbc/api';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { IAssistantHoursService } from './assistant-hours.service.contract';

/**
 * Reads one assistant's logged hours and writes entries against them. Every write is followed by a
 * fresh read, because the totals and the share of completed work are the server's arithmetic and
 * recomputing them here would give the page a second opinion about the same records.
 */
@Injectable({ providedIn: 'root' })
export class AssistantHoursService implements IAssistantHoursService {
  private readonly assistantService = inject(ASSISTANT_SERVICE);
  private readonly storyService = inject(STORY_SERVICE);
  private readonly timeEntryService = inject(TIME_ENTRY_SERVICE);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly hoursValue = signal<AssistantHours | null>(null);
  private readonly storiesValue = signal<readonly Story[]>([]);
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly hours = this.hoursValue.asReadonly();
  readonly stories = this.storiesValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();

  async load(assistantId: string): Promise<void> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      const [hours, stories] = await Promise.all([
        this.assistantService.getHours(assistantId),
        this.storyService.getBacklog(),
      ]);
      this.hoursValue.set(hours);
      // Archived work is retained for reference, so it is not offered as somewhere to spend time.
      this.storiesValue.set(stories.filter((story) => story.lifecycle !== 'archived'));
      this.loadingValue.set('loaded');
    } catch (error) {
      this.fail(error);
    }
  }

  async log(draft: TimeEntryDraft): Promise<boolean> {
    return this.mutate(this.timeEntryService.log(draft), draft.assistantId, 'Hours logged.');
  }

  async delete(entryId: string, assistantId: string): Promise<boolean> {
    return this.mutate(this.timeEntryService.delete(entryId), assistantId, 'Entry deleted.');
  }

  private async mutate(
    request: Promise<unknown>,
    assistantId: string,
    message: string,
  ): Promise<boolean> {
    this.errorValue.set(null);
    try {
      await request;
      this.hoursValue.set(await this.assistantService.getHours(assistantId));
      this.loadingValue.set('loaded');
      this.feedback.show(message);
      return true;
    } catch (error) {
      this.fail(error);
      return false;
    }
  }

  private fail(error: unknown): void {
    const message = presentApiError(error);
    this.errorValue.set(message);
    this.loadingValue.set('failed');
    this.feedback.show(message, 'error');
  }
}
