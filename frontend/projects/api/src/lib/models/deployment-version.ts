/** Identifies the build the workspace is being served from. */
export interface DeploymentVersion {
  readonly version: string;
  /** The source revision the build came from, or null when the build was not stamped with one. */
  readonly commit: string | null;
}
