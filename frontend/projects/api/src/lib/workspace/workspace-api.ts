import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WorkspaceBootstrap } from '../models/workspace-bootstrap';
import { IWorkspaceApi } from './workspace-api.interface';

@Injectable()
export class WorkspaceApi implements IWorkspaceApi {
  private readonly http = inject(HttpClient);

  get(route: string): Promise<WorkspaceBootstrap> {
    return firstValueFrom(this.http.get<WorkspaceBootstrap>('/api/workspace', { params: { route } }));
  }
}
