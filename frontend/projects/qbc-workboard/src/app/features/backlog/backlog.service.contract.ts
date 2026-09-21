import { InjectionToken, Signal } from '@angular/core';
import { Story, StoryPriority } from '@qbc/api';
import { LoadingState } from '../../models/loading-state';
import { BacklogFilter } from './backlog-filter';
import { BacklogSort } from './backlog-sort';

export interface IBacklogService {
  readonly stories: Signal<readonly Story[]>;
  readonly visibleStories: Signal<readonly Story[]>;
  readonly searchText: Signal<string>;
  readonly filter: Signal<BacklogFilter>;
  readonly sort: Signal<BacklogSort>;
  /** `all`, or the one priority the list is narrowed to. */
  readonly priority: Signal<StoryPriority | 'all'>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(): Promise<void>;
  setSearch(text: string): void;
  setFilter(filter: BacklogFilter): void;
  setSort(sort: BacklogSort): void;
  setPriority(priority: StoryPriority | 'all'): void;
  groom(id: string): Promise<boolean>;
  markUnready(id: string): Promise<boolean>;
}

export const BACKLOG_SERVICE = new InjectionToken<IBacklogService>('BACKLOG_SERVICE');
