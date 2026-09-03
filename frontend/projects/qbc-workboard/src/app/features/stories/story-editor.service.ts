import { Injectable, signal } from '@angular/core';
import { IStoryEditorService } from './story-editor.service.contract';

@Injectable({ providedIn: 'root' })
export class StoryEditorService implements IStoryEditorService {
  private readonly storyIdValue = signal<string | null | undefined>(undefined);
  readonly storyId = this.storyIdValue.asReadonly();
  openNew(): void {
    this.storyIdValue.set(null);
  }
  open(storyId: string): void {
    this.storyIdValue.set(storyId);
  }
  close(): void {
    this.storyIdValue.set(undefined);
  }
}
