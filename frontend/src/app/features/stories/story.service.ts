import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { presentApiError } from '../../core/api-error.presenter';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { Story } from '../../models/story';
import { StoryDraft } from '../../models/story-draft';
import { IStoryService } from './story.service.contract';

@Injectable({ providedIn: 'root' })
export class StoryService implements IStoryService {
  private readonly http = inject(HttpClient);
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
      const story = await firstValueFrom(this.http.get<Story>(`/api/stories/${id}`));
      this.selectedValue.set(story);
      this.loadingValue.set('loaded');
      return story;
    } catch (error) { this.fail(error); return null; }
  }

  async save(id: string | null, draft: StoryDraft): Promise<Story | null> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      const request = id ? this.http.put<Story>(`/api/stories/${id}`, draft) : this.http.post<Story>('/api/stories', draft);
      const story = await firstValueFrom(request);
      this.selectedValue.set(story);
      this.loadingValue.set('loaded');
      this.feedback.show(`${story.key} saved.`);
      return story;
    } catch (error) { this.fail(error); return null; }
  }

  archive(id: string): Promise<boolean> { return this.action(`/api/stories/${id}/archive`, 'Story archived.'); }
  restore(id: string): Promise<boolean> { return this.action(`/api/stories/${id}/restore`, 'Story restored as a draft.'); }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`/api/stories/${id}`));
      this.clear();
      this.feedback.show('Story permanently deleted.');
      return true;
    } catch (error) { this.fail(error); return false; }
  }

  clear(): void { this.selectedValue.set(null); this.errorValue.set(null); this.loadingValue.set('idle'); }

  private async action(url: string, message: string): Promise<boolean> {
    try {
      this.selectedValue.set(await firstValueFrom(this.http.post<Story>(url, {})));
      this.feedback.show(message);
      return true;
    } catch (error) { this.fail(error); return false; }
  }

  private fail(error: unknown): void {
    const message = presentApiError(error);
    this.errorValue.set(message);
    this.loadingValue.set('failed');
    this.feedback.show(message, 'error');
  }
}

