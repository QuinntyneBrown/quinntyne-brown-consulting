import { InjectionToken, Signal } from '@angular/core';
import { Epic } from '@qbc/api';
import { LoadingState } from '../../models/loading-state';

export interface IEpicSummaryService {
  /** The epic as it was last saved, which is what unsaved changes are measured against. */
  readonly epic: Signal<Epic | null>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(id: string): Promise<void>;
  /** Resolves to the stored epic, or to null when the save was refused. */
  create(initiativeId: string, name: string, summary: string): Promise<Epic | null>;
  save(id: string, initiativeId: string, name: string, summary: string): Promise<Epic | null>;
}

export const EPIC_SUMMARY_SERVICE = new InjectionToken<IEpicSummaryService>('EPIC_SUMMARY_SERVICE');
