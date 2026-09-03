import { Injectable, inject, signal } from '@angular/core';
import { HIERARCHY_API, Hierarchy, presentApiError } from '@qbc/api';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { IHierarchyService } from './hierarchy.service.contract';

@Injectable({ providedIn: 'root' })
export class HierarchyService implements IHierarchyService {
  private readonly api = inject(HIERARCHY_API);
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
      this.hierarchyValue.set(await this.api.get());
      this.loadingValue.set('loaded');
    } catch (error) {
      this.fail(error);
    }
  }

  async saveInitiative(id: string | null, name: string, description: string): Promise<boolean> {
    return this.mutate(id ? this.api.updateInitiative(id, name, description) : this.api.createInitiative(name, description), 'Initiative saved.');
  }

  async deleteInitiative(id: string): Promise<boolean> {
    return this.mutate(this.api.deleteInitiative(id), 'Initiative deleted.');
  }

  async saveEpic(id: string | null, initiativeId: string, name: string, summary: string): Promise<boolean> {
    return this.mutate(id ? this.api.updateEpic(id, initiativeId, name, summary) : this.api.createEpic(initiativeId, name, summary), 'Epic saved.');
  }

  async deleteEpic(id: string): Promise<boolean> {
    return this.mutate(this.api.deleteEpic(id), 'Epic deleted.');
  }

  private async mutate(request: Promise<unknown>, message: string): Promise<boolean> {
    this.errorValue.set(null);
    try {
      await request;
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
