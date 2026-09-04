import { Injectable, computed, inject, signal } from '@angular/core';
import { DeploymentVersion, VERSION_SERVICE as VERSION_BACKEND_SERVICE } from '@qbc/api';
import { IVersionService } from './version.service.contract';

/** How much of a commit hash identifies a build to a reader without becoming noise. */
const COMMIT_LENGTH = 7;

/**
 * Holds the build the server is running. It is read once, when the first view that shows it is
 * created, because a deployment replaces the browser application along with the server. A
 * failure leaves the label empty: the workspace is still usable when its build is unknown.
 */
@Injectable({ providedIn: 'root' })
export class VersionService implements IVersionService {
  private readonly backendService = inject(VERSION_BACKEND_SERVICE);
  private readonly deploymentValue = signal<DeploymentVersion | null>(null);
  readonly deployment = this.deploymentValue.asReadonly();
  readonly label = computed(() => {
    const deployment = this.deploymentValue();
    if (deployment === null) {
      return '';
    }
    const commit = deployment.commit ? ` · ${deployment.commit.slice(0, COMMIT_LENGTH)}` : '';
    return `Version ${deployment.version}${commit}`;
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.deploymentValue.set(await this.backendService.get());
    } catch {
      // The build stays unreported rather than blocking or interrupting the workspace.
    }
  }
}
