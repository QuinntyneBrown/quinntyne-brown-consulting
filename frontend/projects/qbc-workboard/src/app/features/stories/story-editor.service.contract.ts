import { InjectionToken, Signal } from '@angular/core';

export interface IStoryEditorService {
  readonly storyId: Signal<string | null | undefined>;
  openNew(): void;
  open(storyId: string): void;
  close(): void;
}

export const STORY_EDITOR_SERVICE = new InjectionToken<IStoryEditorService>('STORY_EDITOR_SERVICE');

