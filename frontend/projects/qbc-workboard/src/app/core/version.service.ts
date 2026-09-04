import { Injectable, computed, inject, signal } from '@angular/core';
import { DeploymentVersion, VERSION_SERVICE as VERSION_BACKEND_SERVICE } from '@qbc/api';
import { FRONTEND_BUILD_IDENTITY } from './frontend-build-identity';
import { IVersionService } from './version.service.contract';

/** How much of a commit hash identifies a build to a reader without becoming noise. */
const COMMIT_LENGTH = 7;

/**
 * Holds the identities compiled into the browser and server artifacts. The backend is read once,
 * when the first view that shows it is created. A failure omits only the backend label: the
 * workspace remains usable and the frontend continues to identify itself.
 */
@Injectable({ providedIn: 'root' })
export class VersionService implements IVersionService {
  private readonly backendService = inject(VERSION_BACKEND_SERVICE);
  private readonly backendValue = signal<DeploymentVersion | null>(null);
  readonly frontend = FRONTEND_BUILD_IDENTITY;
  readonly backend = this.backendValue.asReadonly();
  readonly frontendLabel = this.format('Frontend', this.frontend);
  readonly backendLabel = computed(() => {
    const backend = this.backendValue();
    if (backend === null) {
      return '';
    }
    return this.format('Backend', backend);
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.backendValue.set(await this.backendService.get());
    } catch {
      // The browser build remains identified without blocking or interrupting the workspace.
    }
  }

  private format(name: string, build: DeploymentVersion): string {
    const commit = build.commit ? ` · ${build.commit.slice(0, COMMIT_LENGTH)}` : '';
    return `${name} ${build.version}${commit}`;
  }
}
