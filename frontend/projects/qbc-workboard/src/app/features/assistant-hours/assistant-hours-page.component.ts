import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { AssistantHoursStory, TimeEntry } from '@qbc/api';
import {
  AvailabilityComponent,
  AvatarComponent,
  BackLinkComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogComponent,
  CountComponent,
  DialogComponent,
  EmptyStateComponent,
  FormErrorComponent,
  FormGridComponent,
  LoadingStateComponent,
  PageComponent,
  PageHeaderComponent,
  PointsComponent,
  ProgressComponent,
  SegmentedComponent,
  SegmentedOption,
  SelectComponent,
  SelectOption,
  StatusPillComponent,
  TagComponent,
  TextInputComponent,
} from '@qbc/components';
import { describeInvalidFields } from '../../core/describe-invalid-fields';
import { ASSISTANT_HOURS_SERVICE } from './assistant-hours.service.contract';
import { HoursFilter } from './hours-filter';

const STATUS_LABELS: Record<string, string> = {
  toDo: 'To do',
  inProgress: 'In progress',
  done: 'Done',
};

/**
 * One assistant's logged hours: what they spent, how much of it landed on work that is now done,
 * and every story they worked on. The totals are read from the server rather than recomputed here,
 * so the page and the API cannot disagree about the same records.
 */
@Component({
  selector: 'app-assistant-hours-page',
  imports: [
    ReactiveFormsModule,
    AvailabilityComponent,
    AvatarComponent,
    BackLinkComponent,
    ButtonComponent,
    CardComponent,
    ConfirmDialogComponent,
    CountComponent,
    DialogComponent,
    EmptyStateComponent,
    FormErrorComponent,
    FormGridComponent,
    LoadingStateComponent,
    PageComponent,
    PageHeaderComponent,
    PointsComponent,
    ProgressComponent,
    SegmentedComponent,
    SelectComponent,
    StatusPillComponent,
    TagComponent,
    TextInputComponent,
  ],
  templateUrl: './assistant-hours-page.component.html',
  styleUrl: './assistant-hours-page.component.scss',
})
export class AssistantHoursPageComponent {
  private readonly logDialog = viewChild.required<DialogComponent>('logDialog');
  private readonly confirm = viewChild.required(ConfirmDialogComponent);
  private readonly fb = inject(UntypedFormBuilder);
  readonly service = inject(ASSISTANT_HOURS_SERVICE);

  readonly assistantId = input.required<string>();
  /** The entry the dialog is correcting, or null when it is recording a new one. */
  readonly entryId = signal<string | null>(null);
  readonly filter = signal<HoursFilter>('all');
  readonly expanded = signal<readonly string[]>([]);
  readonly pending = signal(false);
  readonly formError = signal('');

  readonly filterOptions: readonly SegmentedOption[] = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'inFlight', label: 'In flight' },
  ];

  readonly form = this.fb.group({
    storyId: ['', Validators.required],
    workedOn: [today(), Validators.required],
    hours: ['1', Validators.required],
    note: [''],
  });

  readonly hours = this.service.hours;

  readonly storyOptions = computed<readonly SelectOption<string>[]>(() =>
    this.service
      .stories()
      .map((story) => ({ value: story.id, label: `${story.key} · ${story.title}` })),
  );

  /** The share of logged time that is on finished work. Nothing logged means nothing to divide. */
  readonly completedShare = computed(() => {
    const hours = this.hours();
    if (!hours || hours.hoursLogged === 0) return 0;
    return Math.round((hours.hoursOnCompletedStories / hours.hoursLogged) * 100);
  });

  readonly visibleStories = computed<readonly AssistantHoursStory[]>(() => {
    const stories = this.hours()?.stories ?? [];
    const filter = this.filter();
    if (filter === 'all') return stories;
    return stories.filter((story) => story.isComplete === (filter === 'completed'));
  });

  constructor() {
    effect(() => {
      const id = this.assistantId();
      if (this.hours()?.assistantId !== id) void this.service.load(id);
    });
  }

  /** The mock's rule: two decimal places at most, and never a trailing zero. */
  formatHours(hours: number): string {
    return `${Math.round(hours * 100) / 100} h`;
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  choose(filter: string): void {
    this.filter.set(filter as HoursFilter);
  }

  isExpanded(storyId: string): boolean {
    return this.expanded().includes(storyId);
  }

  toggle(storyId: string): void {
    const open = this.expanded();
    this.expanded.set(
      open.includes(storyId) ? open.filter((id) => id !== storyId) : [...open, storyId],
    );
  }

  openLog(storyId?: string): void {
    this.entryId.set(null);
    this.formError.set('');
    this.form.reset({
      storyId: storyId ?? this.storyOptions()[0]?.value ?? '',
      workedOn: today(),
      hours: '1',
      note: '',
    });
    this.logDialog().open();
  }

  /** The same form corrects an entry, because an amendment restates what was recorded. */
  openEdit(entry: TimeEntry): void {
    this.entryId.set(entry.id);
    this.formError.set('');
    this.form.reset({
      storyId: entry.storyId,
      workedOn: entry.workedOn,
      hours: String(entry.hours),
      note: entry.note,
    });
    this.logDialog().open();
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set(
        describeInvalidFields(this.form, {
          storyId: 'Story',
          workedOn: 'Date worked',
          hours: 'Hours',
        }),
      );
      return;
    }
    this.formError.set('');
    this.pending.set(true);
    const value = this.form.getRawValue();
    const draft = {
      storyId: value.storyId,
      assistantId: this.assistantId(),
      workedOn: value.workedOn,
      hours: Number(value.hours),
      note: value.note,
    };
    const entryId = this.entryId();
    const saved = entryId
      ? await this.service.update(entryId, draft)
      : await this.service.log(draft);
    this.pending.set(false);
    if (saved) this.logDialog().close();
  }

  async deleteEntry(entry: TimeEntry): Promise<void> {
    if (
      await this.confirm().open(
        `Delete ${this.formatHours(entry.hours)} on ${entry.storyKey}?`,
        'The entry will be permanently removed and the totals will change.',
        'Delete entry',
      )
    ) {
      await this.service.delete(entry.id, this.assistantId());
    }
  }
}

/** A new entry defaults to today, which is when most time is recorded. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
