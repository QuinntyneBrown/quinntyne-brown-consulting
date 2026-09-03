import { InjectionToken, Signal } from '@angular/core';
import { WorkspaceBootstrap } from '@qbc/api';
import { LoadingState } from '../models/loading-state';

export interface IWorkspaceService {
  readonly state: Signal<WorkspaceBootstrap | null>;
  readonly loadingState: Signal<LoadingState>;
  load(route: string): Promise<void>;
}

export const WORKSPACE_SERVICE = new InjectionToken<IWorkspaceService>('WORKSPACE_SERVICE');
