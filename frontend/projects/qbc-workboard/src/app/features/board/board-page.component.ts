import { Component, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { SprintStoryCard } from '@qbc/api';
import {
  BoardColumnComponent,
  ButtonComponent,
  ConfirmDialogComponent,
  EmptyStateComponent,
  FormErrorComponent,
  LoadingStateComponent,
  PageComponent,
  PageHeaderComponent,
  SelectComponent,
  SelectOption,
  SprintHeroComponent,
  StoryCardComponent,
} from '@qbc/components';
import { SprintManagerComponent } from '../sprints/sprint-manager.component';
import { STORY_EDITOR_SERVICE } from '../stories/story-editor.service.contract';
import { SPRINT_EXECUTION_SERVICE } from './sprint-execution.service.contract';

/** The filter value for stories nobody owns; assistant IDs are GUIDs, so it cannot collide. */
const UNASSIGNED = 'unassigned';

@Component({
  selector: 'app-board-page',
  imports: [
    SprintManagerComponent,
    BoardColumnComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    FormErrorComponent,
    LoadingStateComponent,
    PageComponent,
    PageHeaderComponent,
    SelectComponent,
    SprintHeroComponent,
    StoryCardComponent,
  ],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.scss',
})
export class BoardPageComponent implements OnInit {
  private readonly manager = viewChild.required(SprintManagerComponent);
  private readonly confirm = viewChild.required(ConfirmDialogComponent);
  private readonly editor = inject(STORY_EDITOR_SERVICE);
  readonly service = inject(SPRINT_EXECUTION_SERVICE);
  readonly statuses = [
    { value: 'toDo' as const, label: 'To do' },
    { value: 'inProgress' as const, label: 'In progress' },
    { value: 'done' as const, label: 'Done' },
  ];

  private readonly assistantChoice = signal('all');
  readonly assistantOptions = computed<readonly SelectOption<string>[]>(() => {
    const stories = this.service.board()?.stories ?? [];
    const owners = new Map<string, string>();
    for (const story of stories)
      if (story.assistantId) owners.set(story.assistantId, story.assistantName ?? '');
    const count = (id: string | null): number =>
      stories.filter((story) => story.assistantId === id).length;
    const unassigned = count(null);
    return [
      { value: 'all', label: `All assistants (${stories.length})` },
      ...[...owners]
        .sort(([, a], [, b]) => a.localeCompare(b))
        .map(([id, name]) => ({ value: id, label: `${name} (${count(id)})` })),
      ...(unassigned ? [{ value: UNASSIGNED, label: `Unassigned (${unassigned})` }] : []),
    ];
  });
  readonly selectedAssistant = computed(() => {
    const choice = this.assistantChoice();
    return this.assistantOptions().some((option) => option.value === choice) ? choice : 'all';
  });
  readonly visibleStories = computed(() => {
    const choice = this.selectedAssistant();
    const stories = this.service.board()?.stories ?? [];
    if (choice === 'all') return stories;
    const owner = choice === UNASSIGNED ? null : choice;
    return stories.filter((story) => story.assistantId === owner);
  });

  ngOnInit(): void {
    void this.service.load();
  }
  stories(status: SprintStoryCard['boardStatus']): readonly SprintStoryCard[] {
    return this.visibleStories().filter((story) => story.boardStatus === status);
  }
  filterByAssistant(choice: string): void {
    this.assistantChoice.set(choice);
  }
  edit(id: string): void {
    this.editor.open(id);
  }
  manage(): void {
    void this.manager().open();
  }

  async move(story: SprintStoryCard, direction: number): Promise<void> {
    const index = this.statuses.findIndex((item) => item.value === story.boardStatus) + direction;
    if (index >= 0 && index < this.statuses.length)
      await this.service.moveStory(story.storyId, this.statuses[index]!.value);
  }

  async drop(event: DragEvent, status: SprintStoryCard['boardStatus']): Promise<void> {
    event.preventDefault();
    const id = event.dataTransfer?.getData('text/plain');
    if (id) await this.service.moveStory(id, status);
  }

  drag(event: DragEvent, story: SprintStoryCard): void {
    event.dataTransfer?.setData('text/plain', story.storyId);
  }

  async complete(): Promise<void> {
    const board = this.service.board();
    if (
      board &&
      (await this.confirm().open(
        `Complete ${board.name}?`,
        'Done stories remain in history. Unfinished stories return Ready to the backlog.',
        'Complete sprint',
      ))
    )
      await this.service.completeSprint(board.sprintId);
  }

  format(value: string): string {
    return new Intl.DateTimeFormat('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(`${value}T12:00:00`));
  }
}
