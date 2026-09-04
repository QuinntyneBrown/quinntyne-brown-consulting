import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EpicHierarchy, InitiativeHierarchy } from '@qbc/api';
import {
  ButtonComponent,
  ConfirmDialogComponent,
  DialogComponent,
  EmptyStateComponent,
  EpicRowComponent,
  FormErrorComponent,
  FormGridComponent,
  InitiativeCardComponent,
  LoadingStateComponent,
  PageComponent,
  PageHeaderComponent,
  SelectComponent,
  SelectOption,
  TextareaComponent,
  TextInputComponent,
} from '@qbc/components';
import { describeInvalidFields } from '../../core/describe-invalid-fields';
import { summariseBrief } from '../initiative-brief/markdown/summarise-brief';
import { HIERARCHY_SERVICE } from './hierarchy.service.contract';

@Component({
  selector: 'app-hierarchy-page',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    ConfirmDialogComponent,
    DialogComponent,
    EmptyStateComponent,
    EpicRowComponent,
    FormErrorComponent,
    FormGridComponent,
    InitiativeCardComponent,
    LoadingStateComponent,
    PageComponent,
    PageHeaderComponent,
    SelectComponent,
    TextareaComponent,
    TextInputComponent,
  ],
  templateUrl: './hierarchy-page.component.html',
  styleUrl: './hierarchy-page.component.scss',
})
export class HierarchyPageComponent implements OnInit {
  private readonly epicDialog = viewChild.required<DialogComponent>('epicDialog');
  private readonly confirm = viewChild.required(ConfirmDialogComponent);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly router = inject(Router);
  readonly service = inject(HIERARCHY_SERVICE);
  readonly pending = signal(false);
  readonly epicId = signal<string | null>(null);
  readonly epicError = signal('');
  readonly epicForm = this.fb.group({
    initiativeId: ['', Validators.required],
    name: ['', Validators.required],
    summary: ['', Validators.required],
  });

  ngOnInit(): void {
    void this.service.load();
  }

  /**
   * An initiative is a name and a markdown brief saved together, so both are written on the
   * initiative's own page rather than in a form beside the hierarchy.
   */
  newInitiative(): void {
    void this.router.navigate(['/initiatives', 'new']);
  }

  editInitiative(initiative: InitiativeHierarchy): void {
    void this.router.navigate(['/initiatives', initiative.id]);
  }

  /** The card has one line for a whole brief, so it carries the brief's first line of prose. */
  summarise(description: string): string {
    return summariseBrief(description);
  }

  openEpic(initiativeId: string, epic?: EpicHierarchy): void {
    this.epicId.set(epic?.id ?? null);
    this.epicError.set('');
    this.epicForm.reset({ initiativeId, name: epic?.name ?? '', summary: epic?.summary ?? '' });
    this.epicDialog().open();
  }

  async saveEpic(): Promise<void> {
    if (this.epicForm.invalid) {
      this.epicForm.markAllAsTouched();
      this.epicError.set(
        describeInvalidFields(this.epicForm, {
          initiativeId: 'Initiative',
          name: 'Name',
          summary: 'Summary',
        }),
      );
      return;
    }
    this.epicError.set('');
    this.pending.set(true);
    const value = this.epicForm.getRawValue();
    const saved = await this.service.saveEpic(
      this.epicId(),
      value.initiativeId,
      value.name,
      value.summary,
    );
    this.pending.set(false);
    if (saved) this.epicDialog().close();
  }

  async deleteInitiative(initiative: InitiativeHierarchy): Promise<void> {
    if (
      await this.confirm().open(
        `Delete ${initiative.name}?`,
        'The initiative can be deleted only after all of its epics have been moved or removed.',
        'Delete initiative',
      )
    ) {
      await this.service.deleteInitiative(initiative.id);
    }
  }

  async deleteEpic(epic: EpicHierarchy): Promise<void> {
    if (
      await this.confirm().open(
        `Delete ${epic.name}?`,
        'The epic can be deleted only when it contains no stories.',
        'Delete epic',
      )
    ) {
      await this.service.deleteEpic(epic.id);
    }
  }

  initiativeOptions(): readonly SelectOption<string>[] {
    return this.service
      .hierarchy()
      .initiatives.map((initiative) => ({ value: initiative.id, label: initiative.name }));
  }
}
