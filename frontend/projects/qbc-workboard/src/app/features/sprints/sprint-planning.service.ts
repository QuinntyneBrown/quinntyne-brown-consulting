import { Injectable, inject, signal } from '@angular/core';
import { SPRINT_SERVICE as SPRINT_BACKEND_SERVICE, Sprint, presentApiError } from '@qbc/api';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { ISprintPlanningService } from './sprint-planning.service.contract';

@Injectable({ providedIn: 'root' })
export class SprintPlanningService implements ISprintPlanningService {
  private readonly backendService = inject(SPRINT_BACKEND_SERVICE);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly sprintsValue = signal<readonly Sprint[]>([]);
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly sprints = this.sprintsValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();

  async load(): Promise<void> {
    this.loadingValue.set('loading');
    try {
      this.sprintsValue.set(await this.backendService.getAll());
      this.loadingValue.set('loaded');
      this.errorValue.set(null);
    } catch (error) { this.fail(error); }
  }

  save(id: string | null, name: string, goal: string, startDate: string): Promise<boolean> {
    return this.mutate(id ? this.backendService.update(id, name, goal, startDate) : this.backendService.create(name, goal, startDate), 'Sprint saved.');
  }
  start(id: string): Promise<boolean> { return this.mutate(this.backendService.start(id), 'Sprint started.'); }
  delete(id: string): Promise<boolean> { return this.mutate(this.backendService.delete(id), 'Sprint deleted.'); }
  assignStory(sprintId: string, storyId: string): Promise<boolean> { return this.mutate(this.backendService.assignStory(sprintId, storyId), 'Story assigned to sprint.'); }
  removeStory(sprintId: string, storyId: string): Promise<boolean> { return this.mutate(this.backendService.removeStory(sprintId, storyId), 'Story returned to backlog.'); }

  private async mutate(request: Promise<unknown>, message: string): Promise<boolean> {
    try {
      await request;
      await this.load();
      this.feedback.show(message);
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
