import { Injectable, inject, signal } from '@angular/core';
import {
  STORY_SERVICE as STORY_BACKEND_SERVICE,
  Story,
  StoryDraft,
  presentApiError,
} from '@qbc/api';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { IStoryService } from './story.service.contract';

@Injectable({ providedIn: 'root' })
export class StoryService implements IStoryService {
  private readonly backendService = inject(STORY_BACKEND_SERVICE);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly selectedValue = signal<Story | null>(null);
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly selected = this.selectedValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();

  async load(id: string): Promise<Story | null> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      const story = await this.backendService.get(id);
      this.selectedValue.set(story);
      this.loadingValue.set('loaded');
      return story;
    } catch (error) {
      this.fail(error);
      return null;
    }
  }

  async save(id: string | null, draft: StoryDraft): Promise<Story | null> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      const story = await (id
        ? this.backendService.update(id, draft)
        : this.backendService.create(draft));
      this.selectedValue.set(story);
      this.loadingValue.set('loaded');
      this.feedback.show(`${story.key} saved.`);
      return story;
    } catch (error) {
      this.fail(error);
      return null;
    }
  }

  archive(id: string): Promise<boolean> {
    return this.action(this.backendService.archive(id), 'Story archived.');
  }
  restore(id: string): Promise<boolean> {
    return this.action(this.backendService.restore(id), 'Story restored as a draft.');
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.backendService.delete(id);
      this.clear();
      this.feedback.show('Story permanently deleted.');
      return true;
    } catch (error) {
      this.fail(error);
      return false;
    }
  }

  clear(): void {
    this.selectedValue.set(null);
    this.errorValue.set(null);
    this.loadingValue.set('idle');
  }

  private async action(request: Promise<Story>, message: string): Promise<boolean> {
    try {
      this.selectedValue.set(await request);
      this.feedback.show(message);
      return true;
    } catch (error) {
      this.fail(error);
      return false;
    }
  }

  private fail(error: unknown): void {
    const message = presentApiError(error);
    this.errorValue.set(message);
    this.loadingValue.set('failed');
    this.feedback.show(message, 'error');
  }
}
