import { InjectionToken, Signal } from '@angular/core';
import { LoadingState } from '../../models/loading-state';
import { Story } from '../../models/story';
import { StoryDraft } from '../../models/story-draft';

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

