import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Epic } from '../models/epic';
import { Hierarchy } from '../models/hierarchy';
import { Initiative } from '../models/initiative';
import { IHierarchyService } from './hierarchy.service.interface';

@Injectable()
export class HierarchyService implements IHierarchyService {
  private readonly http = inject(HttpClient);

  get(): Promise<Hierarchy> {
    return firstValueFrom(this.http.get<Hierarchy>('/api/initiatives/hierarchy'));
  }

  getInitiative(id: string): Promise<Initiative> {
    return firstValueFrom(this.http.get<Initiative>(`/api/initiatives/${id}`));
  }

  createInitiative(name: string, description: string): Promise<Initiative> {
    return firstValueFrom(this.http.post<Initiative>('/api/initiatives', { name, description }));
  }

  updateInitiative(id: string, name: string, description: string): Promise<Initiative> {
    return firstValueFrom(
      this.http.put<Initiative>(`/api/initiatives/${id}`, { name, description }),
    );
  }

  async deleteInitiative(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/initiatives/${id}`));
  }

  getEpic(id: string): Promise<Epic> {
    return firstValueFrom(this.http.get<Epic>(`/api/epics/${id}`));
  }

  createEpic(initiativeId: string, name: string, summary: string): Promise<Epic> {
    return firstValueFrom(this.http.post<Epic>('/api/epics', { initiativeId, name, summary }));
  }

  updateEpic(id: string, initiativeId: string, name: string, summary: string): Promise<Epic> {
    return firstValueFrom(this.http.put<Epic>(`/api/epics/${id}`, { initiativeId, name, summary }));
  }

  async deleteEpic(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/epics/${id}`));
  }
}
