import { InjectionToken, Signal } from '@angular/core';
import { Initiative } from '@qbc/api';
import { LoadingState } from '../../models/loading-state';

export interface IInitiativeBriefService {
  /** The initiative as it was last saved, which is what unsaved changes are measured against. */
  readonly initiative: Signal<Initiative | null>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(id: string): Promise<void>;
  save(id: string, name: string, description: string): Promise<boolean>;
}

export const INITIATIVE_BRIEF_SERVICE = new InjectionToken<IInitiativeBriefService>(
  'INITIATIVE_BRIEF_SERVICE',
);
