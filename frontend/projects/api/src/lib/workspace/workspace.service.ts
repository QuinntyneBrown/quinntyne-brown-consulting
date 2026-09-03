import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WorkspaceBootstrap } from '../models/workspace-bootstrap';
import { IWorkspaceService } from './workspace.service.interface';

@Injectable()
export class WorkspaceService implements IWorkspaceService {
  private readonly http = inject(HttpClient);

  get(route: string): Promise<WorkspaceBootstrap> {
    return firstValueFrom(this.http.get<WorkspaceBootstrap>('/api/workspace', { params: { route } }));
  }
}
