import { InjectionToken, Signal } from '@angular/core';
import { ActiveSprintBoard } from '@qbc/api';
import { LoadingState } from '../../models/loading-state';

export interface ISprintExecutionService {
  readonly board: Signal<ActiveSprintBoard | null>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(): Promise<void>;
  moveStory(storyId: string, status: 'toDo' | 'inProgress' | 'done'): Promise<boolean>;
  completeSprint(id: string): Promise<boolean>;
}

export const SPRINT_EXECUTION_SERVICE = new InjectionToken<ISprintExecutionService>('SPRINT_EXECUTION_SERVICE');
