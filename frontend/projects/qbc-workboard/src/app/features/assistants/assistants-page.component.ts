import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { Assistant } from '@qbc/api';
import {
  AssignmentLinkComponent,
  AssistantCardComponent,
  ButtonComponent,
  ConfirmDialogComponent,
  DialogComponent,
  EmptyStateComponent,
  FormErrorComponent,
  FormGridComponent,
  LoadingStateComponent,
  PageComponent,
  PageHeaderComponent,
  SelectComponent,
  SelectOption,
  TextInputComponent
} from '@qbc/components';
import { STORY_EDITOR_SERVICE } from '../stories/story-editor.service.contract';
import { ASSISTANT_SERVICE } from './assistant.service.contract';

@Component({
  selector: 'app-assistants-page',
  imports: [
    ReactiveFormsModule,
    AssignmentLinkComponent,
    AssistantCardComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    DialogComponent,
    EmptyStateComponent,
    FormErrorComponent,
    FormGridComponent,
    LoadingStateComponent,
    PageComponent,
    PageHeaderComponent,
    SelectComponent,
    TextInputComponent
  ],
  templateUrl: './assistants-page.component.html',
  styleUrl: './assistants-page.component.scss'
})
export class AssistantsPageComponent implements OnInit {
  private readonly formDialog = viewChild.required<DialogComponent>('formDialog');
  private readonly assignmentsDialog = viewChild.required<DialogComponent>('assignmentsDialog');
  private readonly confirm = viewChild.required(ConfirmDialogComponent);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly editor = inject(STORY_EDITOR_SERVICE);
  readonly service = inject(ASSISTANT_SERVICE);
  readonly assistantId = signal<string | null>(null);
  readonly blockingAssistant = signal<Assistant | null>(null);
  readonly pending = signal(false);
  readonly availabilityOptions: readonly SelectOption<string>[] = [
    { value: 'available', label: 'Available' },
    { value: 'limited', label: 'Limited' },
    { value: 'unavailable', label: 'Unavailable' }
  ];
  readonly form = this.fb.group({
    fullName: ['', Validators.required],
    role: ['', Validators.required],
    specialties: [''],
    availability: ['available', Validators.required]
  });

  ngOnInit(): void { void this.service.load(); }

  openForm(assistant?: Assistant): void {
    this.assistantId.set(assistant?.id ?? null);
    this.form.reset({
      fullName: assistant?.fullName ?? '',
      role: assistant?.role ?? '',
      specialties: assistant?.specialties.join(', ') ?? '',
      availability: assistant?.availability ?? 'available'
    });
    this.formDialog().open();
  }

  async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.pending.set(true);
    const value = this.form.getRawValue();
    const specialties = value.specialties.split(',').map((item: string) => item.trim()).filter(Boolean);
    const saved = await this.service.save(this.assistantId(), value.fullName, value.role, specialties, value.availability);
    this.pending.set(false);
    if (saved) this.formDialog().close();
  }

  async requestDelete(assistant: Assistant): Promise<void> {
    if (assistant.blockingAssignments.length > 0) {
      this.blockingAssistant.set(assistant);
      this.assignmentsDialog().open();
      return;
    }
    if (await this.confirm().open(`Delete ${assistant.fullName}?`, 'The assistant profile will be permanently removed.', 'Delete assistant')) {
      await this.service.delete(assistant.id);
    }
  }

  openAssignment(storyId: string): void {
    this.assignmentsDialog().close();
    this.editor.open(storyId);
  }
}
