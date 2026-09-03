import { WorkspaceBootstrap } from '../models/workspace-bootstrap';

export interface IWorkspaceService {
  get(route: string): Promise<WorkspaceBootstrap>;
}
