import { InjectionToken, Signal } from '@angular/core';
import { DeploymentVersion } from '@qbc/api';

export interface IVersionService {
  /** Identity compiled into the browser bundle. */
  readonly frontend: DeploymentVersion;
  /** Identity returned by the running API, or null until it can be read. */
  readonly backend: Signal<DeploymentVersion | null>;
  readonly frontendLabel: string;
  /** The backend identity as display text, or an empty string until it is known. */
  readonly backendLabel: Signal<string>;
}

export const VERSION_SERVICE = new InjectionToken<IVersionService>('VERSION_SERVICE');
