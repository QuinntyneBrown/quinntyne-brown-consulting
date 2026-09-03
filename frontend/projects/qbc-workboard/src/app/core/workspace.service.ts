import { Injectable, inject, signal } from '@angular/core';
import { WORKSPACE_SERVICE as WORKSPACE_BACKEND_SERVICE, WorkspaceBootstrap } from '@qbc/api';
import { LoadingState } from '../models/loading-state';
import { IWorkspaceService } from './workspace.service.contract';

@Injectable({ providedIn: 'root' })
export class WorkspaceService implements IWorkspaceService {
  private readonly backendService = inject(WORKSPACE_BACKEND_SERVICE);
  private readonly stateValue = signal<WorkspaceBootstrap | null>(null);
  private readonly loadingValue = signal<LoadingState>('idle');
  readonly state = this.stateValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();

  async load(route: string): Promise<void> {
    this.loadingValue.set('loading');
    try {
      this.stateValue.set(await this.backendService.get(route));
      this.loadingValue.set('loaded');
    } catch {
      this.loadingValue.set('failed');
    }
  }
}
