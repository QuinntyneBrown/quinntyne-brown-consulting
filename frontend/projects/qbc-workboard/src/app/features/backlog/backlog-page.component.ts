import { Component, OnInit, inject, signal } from '@angular/core';
import { STORY_PRIORITY_LABELS, STORY_PRIORITY_ORDER, Story, StoryPriority } from '@qbc/api';
import {
  ButtonComponent,
  DataRowComponent,
  EmptyStateComponent,
  FormErrorComponent,
  LoadingStateComponent,
  PageComponent,
  PageHeaderComponent,
  PointsComponent,
  SelectComponent,
  SelectOption,
  SelectValue,
  StatusPillComponent,
  StatusPillTone,
  TagComponent,
  TextInputComponent,
} from '@qbc/components';
import { SPRINT_PLANNING_SERVICE } from '../sprints/sprint-planning.service.contract';
import { STORY_EDITOR_SERVICE } from '../stories/story-editor.service.contract';
import { BacklogFilter } from './backlog-filter';
import { BacklogSort } from './backlog-sort';
import { BACKLOG_SERVICE } from './backlog.service.contract';

@Component({
  selector: 'app-backlog-page',
  imports: [
    ButtonComponent,
    DataRowComponent,
    EmptyStateComponent,
    FormErrorComponent,
    LoadingStateComponent,
    PageComponent,
    PageHeaderComponent,
    PointsComponent,
    SelectComponent,
    StatusPillComponent,
    TagComponent,
    TextInputComponent,
  ],
  templateUrl: './backlog-page.component.html',
  styleUrl: './backlog-page.component.scss',
})
export class BacklogPageComponent implements OnInit {
  readonly service = inject(BACKLOG_SERVICE);
  readonly planning = inject(SPRINT_PLANNING_SERVICE);
  private readonly editor = inject(STORY_EDITOR_SERVICE);
  readonly pendingStoryId = signal<string | null>(null);
  readonly filterOptions: readonly SelectOption<string>[] = [
    { value: 'all', label: 'All stories' },
    { value: 'unscheduled', label: 'Unscheduled' },
    { value: 'ready', label: 'Ready' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ];
  readonly sortOptions: readonly SelectOption<string>[] = [
    { value: 'key', label: 'Story key' },
    { value: 'priority', label: 'Priority' },
  ];
  readonly priorityOptions: readonly SelectOption<string>[] = [
    { value: 'all', label: 'Any priority' },
    ...STORY_PRIORITY_ORDER.map((value) => ({ value, label: STORY_PRIORITY_LABELS[value] })),
  ];

  ngOnInit(): void {
    void Promise.all([this.service.load(), this.planning.load()]);
  }
  edit(id: string): void {
    this.editor.open(id);
  }
  create(): void {
    this.editor.openNew();
  }
  search(value: string): void {
    this.service.setSearch(value);
  }
  filter(value: string): void {
    this.service.setFilter(value as BacklogFilter);
  }
  sort(value: string): void {
    this.service.setSort(value as BacklogSort);
  }
  filterPriority(value: string): void {
    this.service.setPriority(value as StoryPriority | 'all');
  }
  priorityLabel(story: Story): string {
    return STORY_PRIORITY_LABELS[story.priority];
  }

  async groom(story: Story): Promise<void> {
    this.pendingStoryId.set(story.id);
    await this.service.groom(story.id);
    this.pendingStoryId.set(null);
  }

  async markUnready(story: Story): Promise<void> {
    this.pendingStoryId.set(story.id);
    await this.service.markUnready(story.id);
    this.pendingStoryId.set(null);
  }

  /**
   * A story may only be planned into a sprint that has not finished. A story kept in a completed
   * sprint still names it, because that membership is the story's current disposition.
   */
  sprintOptions(story: Story): readonly SelectOption[] {
    const history: SelectOption[] =
      story.sprintId !== null && story.sprintStatus === 'completed'
        ? [{ value: story.sprintId, label: story.sprintName ?? 'Completed sprint', disabled: true }]
        : [];
    return [
      { value: '', label: 'Backlog' },
      ...history,
      ...this.planning
        .sprints()
        .filter((sprint) => sprint.status !== 'completed')
        .map((sprint) => ({ value: sprint.id, label: sprint.name })),
    ];
  }

  async changeSprint(story: Story, value: SelectValue): Promise<void> {
    const sprintId = typeof value === 'string' ? value : '';
    this.pendingStoryId.set(story.id);
    if (sprintId) await this.planning.assignStory(sprintId, story.id);
    else if (story.sprintId) await this.planning.removeStory(story.sprintId, story.id);
    await this.service.load();
    this.pendingStoryId.set(null);
  }

  badge(story: Story): StatusPillTone {
    return story.lifecycle === 'archived' ? 'archived' : story.isReady ? 'ready' : story.lifecycle;
  }
}
