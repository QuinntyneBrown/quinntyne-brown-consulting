import { Injectable, inject, signal } from '@angular/core';
import { WORKSPACE_API, WorkspaceBootstrap } from '@qbc/api';
import { LoadingState } from '../models/loading-state';
import { IWorkspaceService } from './workspace.service.contract';

@Injectable({ providedIn: 'root' })
export class WorkspaceService implements IWorkspaceService {
  private readonly api = inject(WORKSPACE_API);
  private readonly stateValue = signal<WorkspaceBootstrap | null>(null);
  private readonly loadingValue = signal<LoadingState>('idle');
  readonly state = this.stateValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();

  async load(route: string): Promise<void> {
    this.loadingValue.set('loading');
    try {
      this.stateValue.set(await this.api.get(route));
      this.loadingValue.set('loaded');
    } catch {
      this.loadingValue.set('failed');
    }
  }
}
