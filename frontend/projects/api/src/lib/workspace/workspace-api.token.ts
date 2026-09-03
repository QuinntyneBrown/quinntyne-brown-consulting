import { InjectionToken } from '@angular/core';
import { IWorkspaceApi } from './workspace-api.interface';

export const WORKSPACE_API = new InjectionToken<IWorkspaceApi>('WORKSPACE_API');
