import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { presentApiError } from '../../core/api-error.presenter';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { Sprint } from '../../models/sprint';
import { ISprintPlanningService } from './sprint-planning.service.contract';

@Injectable({ providedIn: 'root' })
export class SprintPlanningService implements ISprintPlanningService {
  private readonly http = inject(HttpClient);
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
      this.sprintsValue.set(await firstValueFrom(this.http.get<readonly Sprint[]>('/api/sprints')));
      this.loadingValue.set('loaded');
      this.errorValue.set(null);
    } catch (error) { this.fail(error); }
  }

  save(id: string | null, name: string, goal: string, startDate: string): Promise<boolean> {
    const body = { name, goal, startDate };
    return this.mutate(id ? this.http.put(`/api/sprints/${id}`, body) : this.http.post('/api/sprints', body), 'Sprint saved.');
  }
  start(id: string): Promise<boolean> { return this.mutate(this.http.post(`/api/sprints/${id}/start`, {}), 'Sprint started.'); }
  delete(id: string): Promise<boolean> { return this.mutate(this.http.delete(`/api/sprints/${id}`), 'Sprint deleted.'); }
  assignStory(sprintId: string, storyId: string): Promise<boolean> { return this.mutate(this.http.put(`/api/sprints/${sprintId}/stories/${storyId}`, {}), 'Story assigned to sprint.'); }
  removeStory(sprintId: string, storyId: string): Promise<boolean> { return this.mutate(this.http.delete(`/api/sprints/${sprintId}/stories/${storyId}`), 'Story returned to backlog.'); }

  private async mutate(request: import('rxjs').Observable<unknown>, message: string): Promise<boolean> {
    try {
      await firstValueFrom(request);
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

