import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { Sprint } from '../../models/sprint';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { SPRINT_EXECUTION_SERVICE } from '../board/sprint-execution.service.contract';
import { SPRINT_PLANNING_SERVICE } from './sprint-planning.service.contract';

@Component({
  selector: 'app-sprint-manager',
  imports: [ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './sprint-manager.component.html',
  styleUrl: './sprint-manager.component.scss'
})
export class SprintManagerComponent {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly formDialog = viewChild.required<ElementRef<HTMLDialogElement>>('formDialog');
  private readonly confirm = viewChild.required(ConfirmDialogComponent);
  private readonly fb = inject(UntypedFormBuilder);
  readonly planning = inject(SPRINT_PLANNING_SERVICE);
  private readonly execution = inject(SPRINT_EXECUTION_SERVICE);
  readonly sprintId = signal<string | null>(null);
  readonly editingCompleted = signal(false);
  readonly pending = signal(false);
  readonly form = this.fb.group({ name: ['', Validators.required], goal: ['', Validators.required], startDate: ['', Validators.required] });

  async open(): Promise<void> { await this.planning.load(); this.dialog().nativeElement.showModal(); }

  openForm(sprint?: Sprint): void {
    this.sprintId.set(sprint?.id ?? null);
    this.editingCompleted.set(sprint?.status === 'completed');
    this.form.reset({ name: sprint?.name ?? '', goal: sprint?.goal ?? '', startDate: sprint?.startDate ?? this.today() });
    this.formDialog().nativeElement.showModal();
  }

  async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.pending.set(true);
    const value = this.form.getRawValue();
    const saved = await this.planning.save(this.sprintId(), value.name, value.goal, value.startDate);
    this.pending.set(false);
    if (saved) this.formDialog().nativeElement.close();
  }

  async start(sprint: Sprint): Promise<void> {
    if (await this.confirm().open(`Start ${sprint.name}?`, 'Its planned stories will become the active commitment on the board.', 'Start sprint')) {
      if (await this.planning.start(sprint.id)) await this.execution.load();
    }
  }

  async delete(sprint: Sprint): Promise<void> {
    if (await this.confirm().open(`Delete ${sprint.name}?`, 'Assigned stories will return to the Ready backlog.', 'Delete sprint')) await this.planning.delete(sprint.id);
  }

  formatDates(sprint: Sprint): string { return `${this.format(sprint.startDate)} – ${this.format(sprint.endDate)}`; }
  private format(value: string): string { return new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`)); }
  private today(): string { return new Date().toISOString().slice(0, 10); }
}

