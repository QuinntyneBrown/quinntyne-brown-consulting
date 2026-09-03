import { WorkspaceBootstrap } from '../models/workspace-bootstrap';

export interface IWorkspaceApi {
  get(route: string): Promise<WorkspaceBootstrap>;
}
