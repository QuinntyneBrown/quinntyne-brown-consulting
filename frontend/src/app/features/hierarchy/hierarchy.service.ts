import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { presentApiError } from '../../core/api-error.presenter';
import { Hierarchy } from '../../models/hierarchy';
import { LoadingState } from '../../models/loading-state';
import { IHierarchyService } from './hierarchy.service.contract';

@Injectable({ providedIn: 'root' })
export class HierarchyService implements IHierarchyService {
  private readonly http = inject(HttpClient);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly hierarchyValue = signal<Hierarchy>({ initiatives: [] });
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly hierarchy = this.hierarchyValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();

  async load(): Promise<void> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      this.hierarchyValue.set(await firstValueFrom(this.http.get<Hierarchy>('/api/initiatives/hierarchy')));
      this.loadingValue.set('loaded');
    } catch (error) {
      this.fail(error);
    }
  }

  async saveInitiative(id: string | null, name: string, description: string): Promise<boolean> {
    return this.mutate(id ? this.http.put(`/api/initiatives/${id}`, { name, description }) : this.http.post('/api/initiatives', { name, description }), 'Initiative saved.');
  }

  async deleteInitiative(id: string): Promise<boolean> {
    return this.mutate(this.http.delete(`/api/initiatives/${id}`), 'Initiative deleted.');
  }

  async saveEpic(id: string | null, initiativeId: string, name: string, summary: string): Promise<boolean> {
    const body = { initiativeId, name, summary };
    return this.mutate(id ? this.http.put(`/api/epics/${id}`, body) : this.http.post('/api/epics', body), 'Epic saved.');
  }

  async deleteEpic(id: string): Promise<boolean> {
    return this.mutate(this.http.delete(`/api/epics/${id}`), 'Epic deleted.');
  }

  private async mutate(request: import('rxjs').Observable<unknown>, message: string): Promise<boolean> {
    this.errorValue.set(null);
    try {
      await firstValueFrom(request);
      await this.load();
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

