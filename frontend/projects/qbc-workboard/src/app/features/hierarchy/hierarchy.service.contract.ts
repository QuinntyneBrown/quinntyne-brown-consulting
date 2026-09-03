import { InjectionToken, Signal } from '@angular/core';
import { Hierarchy } from '@qbc/api';
import { LoadingState } from '../../models/loading-state';

export interface IHierarchyService {
  readonly hierarchy: Signal<Hierarchy>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(): Promise<void>;
  saveInitiative(id: string | null, name: string, description: string): Promise<boolean>;
  deleteInitiative(id: string): Promise<boolean>;
  saveEpic(id: string | null, initiativeId: string, name: string, summary: string): Promise<boolean>;
  deleteEpic(id: string): Promise<boolean>;
}

export const HIERARCHY_SERVICE = new InjectionToken<IHierarchyService>('HIERARCHY_SERVICE');
