import { Injectable, inject, signal } from '@angular/core';
import { SPRINT_SERVICE as SPRINT_BACKEND_SERVICE, STORY_SERVICE as STORY_BACKEND_SERVICE, ActiveSprintBoard, presentApiError } from '@qbc/api';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { ISprintExecutionService } from './sprint-execution.service.contract';

@Injectable({ providedIn: 'root' })
export class SprintExecutionService implements ISprintExecutionService {
  private readonly sprintService = inject(SPRINT_BACKEND_SERVICE);
  private readonly storyService = inject(STORY_BACKEND_SERVICE);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly boardValue = signal<ActiveSprintBoard | null>(null);
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly board = this.boardValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();

  async load(): Promise<void> {
    this.loadingValue.set('loading');
    try {
      this.boardValue.set(await this.sprintService.getActiveBoard());
      this.loadingValue.set('loaded');
      this.errorValue.set(null);
    } catch (error) { this.fail(error); }
  }

  async moveStory(storyId: string, status: 'toDo' | 'inProgress' | 'done'): Promise<boolean> {
    try {
      await this.storyService.move(storyId, status);
      await this.load();
      this.feedback.show('Story moved.');
      return true;
    } catch (error) { this.fail(error); return false; }
  }

  async completeSprint(id: string): Promise<boolean> {
    try {
      await this.sprintService.complete(id);
      await this.load();
      this.feedback.show('Sprint completed. Unfinished work returned to the backlog.');
      return true;
    } catch (error) { this.fail(error); return false; }
  }

  private fail(error: unknown): void {
    const message = presentApiError(error);
    this.errorValue.set(message);
    this.loadingValue.set('failed');
    this.feedback.show(message, 'error');
  }
}
