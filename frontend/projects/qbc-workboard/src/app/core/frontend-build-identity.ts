import { DeploymentVersion } from '@qbc/api';

declare const QBC_FRONTEND_VERSION: string;
declare const QBC_FRONTEND_COMMIT: string | null;

/** Identity compiled into this browser application, independent of the API build. */
export const FRONTEND_BUILD_IDENTITY: DeploymentVersion = {
  version: QBC_FRONTEND_VERSION,
  commit: QBC_FRONTEND_COMMIT,
};
