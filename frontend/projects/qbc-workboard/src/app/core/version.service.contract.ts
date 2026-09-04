import { InjectionToken, Signal } from '@angular/core';
import { DeploymentVersion } from '@qbc/api';

export interface IVersionService {
  readonly deployment: Signal<DeploymentVersion | null>;
  /** The build identity as one line of display text, or an empty string until it is known. */
  readonly label: Signal<string>;
}

export const VERSION_SERVICE = new InjectionToken<IVersionService>('VERSION_SERVICE');
