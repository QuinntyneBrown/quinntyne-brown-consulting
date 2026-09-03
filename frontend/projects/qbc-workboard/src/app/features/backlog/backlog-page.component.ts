import { Component, OnInit, inject, signal } from '@angular/core';
import { Story } from '../../models/story';
import { SPRINT_PLANNING_SERVICE } from '../sprints/sprint-planning.service.contract';
import { STORY_EDITOR_SERVICE } from '../stories/story-editor.service.contract';
import { BacklogFilter } from './backlog-filter';
import { BACKLOG_SERVICE } from './backlog.service.contract';

@Component({
  selector: 'app-backlog-page',
  templateUrl: './backlog-page.component.html',
  styleUrl: './backlog-page.component.scss'
})
export class BacklogPageComponent implements OnInit {
  readonly service = inject(BACKLOG_SERVICE);
  readonly planning = inject(SPRINT_PLANNING_SERVICE);
  private readonly editor = inject(STORY_EDITOR_SERVICE);
  readonly pendingStoryId = signal<string | null>(null);

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

  async changeSprint(story: Story, sprintId: string): Promise<void> {
    this.pendingStoryId.set(story.id);
    if (sprintId) await this.planning.assignStory(sprintId, story.id);
    else if (story.sprintId) await this.planning.removeStory(story.sprintId, story.id);
    await this.service.load();
    this.pendingStoryId.set(null);
  }

  badge(story: Story): string { return story.lifecycle === 'archived' ? 'archived' : story.isReady ? 'ready' : story.lifecycle; }
}

