import { InjectionToken, Signal } from '@angular/core';
import { LoadingState } from '../../models/loading-state';
import { Sprint } from '../../models/sprint';

export interface ISprintPlanningService {
  readonly sprints: Signal<readonly Sprint[]>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(): Promise<void>;
  save(id: string | null, name: string, goal: string, startDate: string): Promise<boolean>;
  start(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  assignStory(sprintId: string, storyId: string): Promise<boolean>;
  removeStory(sprintId: string, storyId: string): Promise<boolean>;
}

export const SPRINT_PLANNING_SERVICE = new InjectionToken<ISprintPlanningService>('SPRINT_PLANNING_SERVICE');

