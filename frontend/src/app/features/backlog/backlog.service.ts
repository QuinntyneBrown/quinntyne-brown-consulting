import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { presentApiError } from '../../core/api-error.presenter';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { Story } from '../../models/story';
import { BacklogFilter } from './backlog-filter';
import { IBacklogService } from './backlog.service.contract';

@Injectable({ providedIn: 'root' })
export class BacklogService implements IBacklogService {
  private readonly http = inject(HttpClient);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly storiesValue = signal<readonly Story[]>([]);
  private readonly searchValue = signal('');
  private readonly filterValue = signal<BacklogFilter>('all');
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly stories = this.storiesValue.asReadonly();
  readonly searchText = this.searchValue.asReadonly();
  readonly filter = this.filterValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();
  readonly visibleStories = computed(() => {
    const search = this.searchValue().trim().toLowerCase();
    const filter = this.filterValue();
    return this.storiesValue().filter(story => {
      const matchesSearch = !search || `${story.key} ${story.title} ${story.epicName}`.toLowerCase().includes(search);
      const matchesFilter = filter === 'all'
        || (filter === 'unscheduled' && !story.sprintId && story.lifecycle !== 'archived')
        || (filter === 'ready' && story.isReady && story.lifecycle !== 'archived')
        || (filter === 'draft' && story.lifecycle === 'draft')
        || (filter === 'archived' && story.lifecycle === 'archived');
      return matchesSearch && matchesFilter;
    });
  });

  async load(): Promise<void> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      this.storiesValue.set(await firstValueFrom(this.http.get<readonly Story[]>('/api/stories/backlog')));
      this.loadingValue.set('loaded');
    } catch (error) { this.fail(error); }
  }

  setSearch(text: string): void { this.searchValue.set(text); }
  setFilter(filter: BacklogFilter): void { this.filterValue.set(filter); }
  groom(id: string): Promise<boolean> { return this.action(`/api/stories/${id}/groom`, 'Story is Ready.'); }
  markUnready(id: string): Promise<boolean> { return this.action(`/api/stories/${id}/mark-unready`, 'Story marked Not Ready.'); }

  private async action(url: string, message: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.post<Story>(url, {}));
      await this.load();
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

