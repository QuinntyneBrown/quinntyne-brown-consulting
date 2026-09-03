import { InjectionToken, Signal } from '@angular/core';
import { LoadingState } from '../models/loading-state';
import { WorkspaceBootstrap } from '../models/workspace-bootstrap';

export interface IWorkspaceService {
  readonly state: Signal<WorkspaceBootstrap | null>;
  readonly loadingState: Signal<LoadingState>;
  load(route: string): Promise<void>;
}

export const WORKSPACE_SERVICE = new InjectionToken<IWorkspaceService>('WORKSPACE_SERVICE');

