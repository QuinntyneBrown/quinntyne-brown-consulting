import { InjectionToken, Signal } from '@angular/core';
import { Assistant } from '@qbc/api';
import { LoadingState } from '../../models/loading-state';

export interface IAssistantService {
  readonly assistants: Signal<readonly Assistant[]>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(): Promise<void>;
  save(id: string | null, fullName: string, role: string, specialties: readonly string[], availability: Assistant['availability']): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export const ASSISTANT_SERVICE = new InjectionToken<IAssistantService>('ASSISTANT_SERVICE');
