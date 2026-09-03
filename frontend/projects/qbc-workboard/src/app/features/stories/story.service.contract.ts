import { InjectionToken, Signal } from '@angular/core';
import { Story, StoryDraft } from '@qbc/api';
import { LoadingState } from '../../models/loading-state';

export interface IStoryService {
  readonly selected: Signal<Story | null>;
  readonly loadingState: Signal<LoadingState>;
  readonly error: Signal<string | null>;
  load(id: string): Promise<Story | null>;
  save(id: string | null, draft: StoryDraft): Promise<Story | null>;
  archive(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  clear(): void;
}

export const STORY_SERVICE = new InjectionToken<IStoryService>('STORY_SERVICE');
