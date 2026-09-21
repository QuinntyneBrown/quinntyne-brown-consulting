import { Injectable, computed, inject, signal } from '@angular/core';
import {
  STORY_SERVICE as STORY_BACKEND_SERVICE,
  Story,
  StoryPriority,
  presentApiError,
  storyPriorityRank,
} from '@qbc/api';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { BacklogFilter } from './backlog-filter';
import { BacklogSort } from './backlog-sort';
import { IBacklogService } from './backlog.service.contract';

@Injectable({ providedIn: 'root' })
export class BacklogService implements IBacklogService {
  private readonly backendService = inject(STORY_BACKEND_SERVICE);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly storiesValue = signal<readonly Story[]>([]);
  private readonly searchValue = signal('');
  private readonly filterValue = signal<BacklogFilter>('all');
  private readonly sortValue = signal<BacklogSort>('key');
  private readonly priorityValue = signal<StoryPriority | 'all'>('all');
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly stories = this.storiesValue.asReadonly();
  readonly searchText = this.searchValue.asReadonly();
  readonly filter = this.filterValue.asReadonly();
  readonly sort = this.sortValue.asReadonly();
  readonly priority = this.priorityValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();
  readonly visibleStories = computed(() => {
    const search = this.searchValue().trim().toLowerCase();
    const filter = this.filterValue();
    const sort = this.sortValue();
    const priority = this.priorityValue();
    const stories = this.storiesValue().filter((story) => {
      const matchesSearch =
        !search || `${story.key} ${story.title} ${story.epicName}`.toLowerCase().includes(search);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'unscheduled' && !story.sprintId && story.lifecycle !== 'archived') ||
        (filter === 'ready' && story.isReady && story.lifecycle !== 'archived') ||
        (filter === 'draft' && story.lifecycle === 'draft') ||
        (filter === 'archived' && story.lifecycle === 'archived');
      const matchesPriority = priority === 'all' || story.priority === priority;
      return matchesSearch && matchesFilter && matchesPriority;
    });
    // Most urgent first; stories of equal priority, and the default view, read by story key.
    return [...stories].sort(
      (left, right) =>
        (sort === 'priority'
          ? storyPriorityRank(right.priority) - storyPriorityRank(left.priority)
          : 0) || storyNumber(left) - storyNumber(right),
    );
  });

  async load(): Promise<void> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      this.storiesValue.set(await this.backendService.getBacklog());
      this.loadingValue.set('loaded');
    } catch (error) {
      this.fail(error);
    }
  }

  setSearch(text: string): void {
    this.searchValue.set(text);
  }
  setFilter(filter: BacklogFilter): void {
    this.filterValue.set(filter);
  }
  setSort(sort: BacklogSort): void {
    this.sortValue.set(sort);
  }
  setPriority(priority: StoryPriority | 'all'): void {
    this.priorityValue.set(priority);
  }
  groom(id: string): Promise<boolean> {
    return this.action(this.backendService.groom(id), 'Story is Ready.');
  }
  markUnready(id: string): Promise<boolean> {
    return this.action(this.backendService.markUnready(id), 'Story marked Not Ready.');
  }

  private async action(request: Promise<Story>, message: string): Promise<boolean> {
    try {
      await request;
      await this.load();
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

/** The number behind `QBC-{number}`, so QBC-99 sorts before QBC-101. */
function storyNumber(story: Story): number {
  return Number(story.key.slice(story.key.indexOf('-') + 1));
}
