import { Component, OnInit, inject, viewChild } from '@angular/core';
import { SprintStoryCard } from '@qbc/api';
import { ConfirmDialogComponent, EmptyStateComponent, PageHeaderComponent } from '@qbc/components';
import { SprintManagerComponent } from '../sprints/sprint-manager.component';
import { STORY_EDITOR_SERVICE } from '../stories/story-editor.service.contract';
import { SPRINT_EXECUTION_SERVICE } from './sprint-execution.service.contract';

@Component({
  selector: 'app-board-page',
  imports: [SprintManagerComponent, ConfirmDialogComponent, EmptyStateComponent, PageHeaderComponent],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.scss'
})
export class BoardPageComponent implements OnInit {
  private readonly manager = viewChild.required(SprintManagerComponent);
  private readonly confirm = viewChild.required(ConfirmDialogComponent);
  private readonly editor = inject(STORY_EDITOR_SERVICE);
  readonly service = inject(SPRINT_EXECUTION_SERVICE);
  readonly statuses = [
    { value: 'toDo' as const, label: 'To do' },
    { value: 'inProgress' as const, label: 'In progress' },
    { value: 'done' as const, label: 'Done' }
  ];

  ngOnInit(): void { void this.service.load(); }
  stories(status: SprintStoryCard['boardStatus']): readonly SprintStoryCard[] { return this.service.board()?.stories.filter(story => story.boardStatus === status) ?? []; }
  edit(id: string): void { this.editor.open(id); }
  manage(): void { void this.manager().open(); }

  async move(story: SprintStoryCard, direction: number): Promise<void> {
    const index = this.statuses.findIndex(item => item.value === story.boardStatus) + direction;
    if (index >= 0 && index < this.statuses.length) await this.service.moveStory(story.storyId, this.statuses[index]!.value);
  }

  async drop(event: DragEvent, status: SprintStoryCard['boardStatus']): Promise<void> {
    event.preventDefault();
    const id = event.dataTransfer?.getData('text/plain');
    if (id) await this.service.moveStory(id, status);
  }

  drag(event: DragEvent, story: SprintStoryCard): void { event.dataTransfer?.setData('text/plain', story.storyId); }

  async complete(): Promise<void> {
    const board = this.service.board();
    if (board && await this.confirm().open(`Complete ${board.name}?`, 'Done stories remain in history. Unfinished stories return Ready to the backlog.', 'Complete sprint')) await this.service.completeSprint(board.sprintId);
  }

  format(value: string): string { return new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`)); }
}
