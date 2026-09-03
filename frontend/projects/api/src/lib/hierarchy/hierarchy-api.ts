import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Epic } from '../models/epic';
import { Hierarchy } from '../models/hierarchy';
import { Initiative } from '../models/initiative';
import { IHierarchyApi } from './hierarchy-api.interface';

@Injectable()
export class HierarchyApi implements IHierarchyApi {
  private readonly http = inject(HttpClient);

  get(): Promise<Hierarchy> {
    return firstValueFrom(this.http.get<Hierarchy>('/api/initiatives/hierarchy'));
  }

  createInitiative(name: string, description: string): Promise<Initiative> {
    return firstValueFrom(this.http.post<Initiative>('/api/initiatives', { name, description }));
  }

  updateInitiative(id: string, name: string, description: string): Promise<Initiative> {
    return firstValueFrom(this.http.put<Initiative>(`/api/initiatives/${id}`, { name, description }));
  }

  async deleteInitiative(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/initiatives/${id}`));
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
