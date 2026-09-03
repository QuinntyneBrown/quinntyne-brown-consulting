import { InjectionToken } from '@angular/core';
import { IWorkspaceService } from './workspace.service.interface';

export const WORKSPACE_SERVICE = new InjectionToken<IWorkspaceService>('WORKSPACE_SERVICE');
