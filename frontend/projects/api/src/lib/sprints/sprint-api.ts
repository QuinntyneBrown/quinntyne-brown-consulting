import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActiveSprintBoard } from '../models/active-sprint-board';
import { Sprint } from '../models/sprint';
import { ISprintApi } from './sprint-api.interface';

@Injectable()
export class SprintApi implements ISprintApi {
  private readonly http = inject(HttpClient);

  getAll(): Promise<readonly Sprint[]> {
    return firstValueFrom(this.http.get<readonly Sprint[]>('/api/sprints'));
  }

  get(id: string): Promise<Sprint> {
    return firstValueFrom(this.http.get<Sprint>(`/api/sprints/${id}`));
  }

  getActiveBoard(): Promise<ActiveSprintBoard | null> {
    return firstValueFrom(this.http.get<ActiveSprintBoard | null>('/api/sprints/active/board'));
  }

  create(name: string, goal: string, startDate: string): Promise<Sprint> {
    return firstValueFrom(this.http.post<Sprint>('/api/sprints', { name, goal, startDate }));
  }

  update(id: string, name: string, goal: string, startDate: string): Promise<Sprint> {
    return firstValueFrom(this.http.put<Sprint>(`/api/sprints/${id}`, { name, goal, startDate }));
  }

  start(id: string): Promise<Sprint> {
    return firstValueFrom(this.http.post<Sprint>(`/api/sprints/${id}/start`, {}));
  }

  complete(id: string): Promise<Sprint> {
    return firstValueFrom(this.http.post<Sprint>(`/api/sprints/${id}/complete`, {}));
  }

  async assignStory(sprintId: string, storyId: string): Promise<void> {
    await firstValueFrom(this.http.put<void>(`/api/sprints/${sprintId}/stories/${storyId}`, {}));
  }

  async removeStory(sprintId: string, storyId: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/sprints/${sprintId}/stories/${storyId}`));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/sprints/${id}`));
  }
}
