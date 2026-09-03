import { Component, effect, inject, signal, viewChild } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import {
  ActionGroupComponent,
  ButtonComponent,
  CheckboxComponent,
  ConfirmDialogComponent,
  DialogComponent,
  FormErrorComponent,
  FormGridComponent,
  SectionLabelComponent,
  SelectComponent,
  SelectItem,
  SelectOption,
  TaskItemComponent,
  TextareaComponent,
  TextInputComponent,
} from '@qbc/components';
import { ASSISTANT_SERVICE } from '../assistants/assistant.service.contract';
import { BACKLOG_SERVICE } from '../backlog/backlog.service.contract';
import { SPRINT_EXECUTION_SERVICE } from '../board/sprint-execution.service.contract';
import { HIERARCHY_SERVICE } from '../hierarchy/hierarchy.service.contract';
import { STORY_EDITOR_SERVICE } from './story-editor.service.contract';
import { STORY_SERVICE } from './story.service.contract';

@Component({
  selector: 'app-story-editor',
  imports: [
    ReactiveFormsModule,
    ActionGroupComponent,
    ButtonComponent,
    CheckboxComponent,
    ConfirmDialogComponent,
    DialogComponent,
    FormErrorComponent,
    FormGridComponent,
    SectionLabelComponent,
    SelectComponent,
    TaskItemComponent,
    TextareaComponent,
    TextInputComponent,
  ],
  templateUrl: './story-editor.component.html',
  styleUrl: './story-editor.component.scss',
})
export class StoryEditorComponent {
  private readonly dialog = viewChild.required<DialogComponent>('dialog');
  private readonly confirm = viewChild.required(ConfirmDialogComponent);
  private readonly fb = inject(UntypedFormBuilder);
  readonly editor = inject(STORY_EDITOR_SERVICE);
  readonly stories = inject(STORY_SERVICE);
  readonly hierarchy = inject(HIERARCHY_SERVICE);
  readonly assistants = inject(ASSISTANT_SERVICE);
  private readonly backlog = inject(BACKLOG_SERVICE);
  private readonly board = inject(SPRINT_EXECUTION_SERVICE);
  readonly pending = signal(false);
  readonly pointOptions: readonly SelectOption<number | null>[] = [
    { value: null, label: 'Not estimated' },
    ...[1, 2, 3, 5, 8, 13].map((value) => ({ value, label: String(value) })),
  ];
  readonly form = this.fb.group({
    epicId: ['', Validators.required],
    title: ['', Validators.required],
    description: [''],
    acceptanceCriteria: [''],
    points: [null],
    assistantId: [null],
    tasks: this.fb.array([]),
  });

  constructor() {
    effect(() => {
      const id = this.editor.storyId();
      if (id === undefined) return;
      void this.open(id);
    });
  }

  get tasks(): UntypedFormArray {
    return this.form.controls['tasks'] as UntypedFormArray;
  }

  addTask(): void {
    this.tasks.push(
      this.fb.group({
        id: [null],
        title: ['', Validators.required],
        isComplete: [false],
        assistantId: [null],
      }),
    );
  }

  removeTask(index: number): void {
    this.tasks.removeAt(index);
  }

  epicOptions(): readonly SelectItem[] {
    return [
      { value: '', label: 'Choose an epic' },
      ...this.hierarchy.hierarchy().initiatives.map((initiative) => ({
        label: initiative.name,
        options: initiative.epics.map((epic) => ({ value: epic.id, label: epic.name })),
      })),
    ];
  }

  assistantOptions(): readonly SelectOption[] {
    return [
      { value: null, label: 'Unassigned' },
      ...this.assistants
        .assistants()
        .map((assistant) => ({ value: assistant.id, label: assistant.fullName })),
    ];
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.pending.set(true);
    const value = this.form.getRawValue();
    const saved = await this.stories.save(this.editor.storyId() ?? null, {
      epicId: value.epicId,
      title: value.title,
      description: value.description,
      acceptanceCriteria: value.acceptanceCriteria,
      points: value.points === null || value.points === '' ? null : Number(value.points),
      assistantId: value.assistantId || null,
      tasks: value.tasks.map((task: Record<string, unknown>) => ({
        id: (task['id'] as string | null) ?? null,
        title: task['title'] as string,
        isComplete: Boolean(task['isComplete']),
        assistantId: (task['assistantId'] as string | null) || null,
      })),
    });
    this.pending.set(false);
    if (saved) {
      await this.refresh();
      this.close();
    }
  }

  async archive(): Promise<void> {
    const story = this.stories.selected();
    if (
      !story ||
      !(await this.confirm().open(
        `Archive ${story.key}?`,
        'The story will leave its sprint and remain available through the Archived backlog filter.',
        'Archive',
      ))
    )
      return;
    if (await this.stories.archive(story.id)) {
      await this.refresh();
      this.close();
    }
  }

  async restore(): Promise<void> {
    const story = this.stories.selected();
    if (story && (await this.stories.restore(story.id))) {
      await this.refresh();
      this.close();
    }
  }

  async delete(): Promise<void> {
    const story = this.stories.selected();
    if (
      !story ||
      !(await this.confirm().open(
        `Permanently delete ${story.key}?`,
        'This removes the story and all of its tasks. This action cannot be undone.',
        'Delete permanently',
      ))
    )
      return;
    if (await this.stories.delete(story.id)) {
      await this.refresh();
      this.close();
    }
  }

  close(): void {
    this.dialog().close();
    this.editor.close();
    this.stories.clear();
  }

  private async open(id: string | null): Promise<void> {
    await Promise.all([this.hierarchy.load(), this.assistants.load()]);
    this.form.reset({
      epicId: '',
      title: '',
      description: '',
      acceptanceCriteria: '',
      points: null,
      assistantId: null,
    });
    this.tasks.clear();
    if (id) {
      const story = await this.stories.load(id);
      if (!story) return;
      this.form.patchValue({
        epicId: story.epicId,
        title: story.title,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
        points: story.points,
        assistantId: story.assistantId,
      });
      for (const task of story.tasks) {
        this.tasks.push(
          this.fb.group({
            id: [task.id],
            title: [task.title, Validators.required],
            isComplete: [task.isComplete],
            assistantId: [task.assistantId],
          }),
        );
      }
    }
    this.dialog().open();
  }

  private async refresh(): Promise<void> {
    await Promise.all([
      this.backlog.load(),
      this.board.load(),
      this.hierarchy.load(),
      this.assistants.load(),
    ]);
  }
}
