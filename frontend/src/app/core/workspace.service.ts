import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LoadingState } from '../models/loading-state';
import { WorkspaceBootstrap } from '../models/workspace-bootstrap';
import { IWorkspaceService } from './workspace.service.contract';

@Injectable({ providedIn: 'root' })
export class WorkspaceService implements IWorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly stateValue = signal<WorkspaceBootstrap | null>(null);
  private readonly loadingValue = signal<LoadingState>('idle');
  readonly state = this.stateValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();

  async load(route: string): Promise<void> {
    this.loadingValue.set('loading');
    try {
      this.stateValue.set(await firstValueFrom(this.http.get<WorkspaceBootstrap>('/api/workspace', { params: { route } })));
      this.loadingValue.set('loaded');
    } catch {
      this.loadingValue.set('failed');
    }
  }
}

