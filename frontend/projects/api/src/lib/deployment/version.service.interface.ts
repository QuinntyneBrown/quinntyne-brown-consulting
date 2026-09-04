import { DeploymentVersion } from '../models/deployment-version';

export interface IVersionService {
  get(): Promise<DeploymentVersion>;
}
