import { InjectionToken, Signal } from '@angular/core';
import { LoadingState } from '../../models/loading-state';
import { Story } from '../../models/story';
import { BacklogFilter } from './backlog-filter';

export interface IBacklogService {
  readonly stories: Signal<readonly Story[]>;
  readonly visibleStories: Signal<readonly Story[]>;
  readonly searchText: Signal<string>;
  readonly filter: Signal<BacklogFilter>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(): Promise<void>;
  setSearch(text: string): void;
  setFilter(filter: BacklogFilter): void;
  groom(id: string): Promise<boolean>;
  markUnready(id: string): Promise<boolean>;
}

export const BACKLOG_SERVICE = new InjectionToken<IBacklogService>('BACKLOG_SERVICE');

