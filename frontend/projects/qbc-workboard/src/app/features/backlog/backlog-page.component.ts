import { Component, OnInit, inject, signal } from '@angular/core';
import { Story } from '@qbc/api';
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
  TextInputComponent
} from '@qbc/components';
import { SPRINT_PLANNING_SERVICE } from '../sprints/sprint-planning.service.contract';
import { STORY_EDITOR_SERVICE } from '../stories/story-editor.service.contract';
import { BacklogFilter } from './backlog-filter';
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
    TextInputComponent
  ],
  templateUrl: './backlog-page.component.html',
  styleUrl: './backlog-page.component.scss'
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
    { value: 'archived', label: 'Archived' }
  ];

  ngOnInit(): void { void Promise.all([this.service.load(), this.planning.load()]); }
  edit(id: string): void { this.editor.open(id); }
  search(value: string): void { this.service.setSearch(value); }
  filter(value: string): void { this.service.setFilter(value as BacklogFilter); }

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

  sprintOptions(): readonly SelectOption[] {
    return [
      { value: '', label: 'Backlog' },
      ...this.planning.sprints()
        .filter(sprint => sprint.status !== 'completed')
        .map(sprint => ({ value: sprint.id, label: sprint.name }))
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

  badge(story: Story): StatusPillTone { return story.lifecycle === 'archived' ? 'archived' : story.isReady ? 'ready' : story.lifecycle; }
}
