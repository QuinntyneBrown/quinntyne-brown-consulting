import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { EpicHierarchy, InitiativeHierarchy } from '@qbc/api';
import { ConfirmDialogComponent, EmptyStateComponent, PageHeaderComponent } from '@qbc/components';
import { HIERARCHY_SERVICE } from './hierarchy.service.contract';

@Component({
  selector: 'app-hierarchy-page',
  imports: [ReactiveFormsModule, ConfirmDialogComponent, EmptyStateComponent, PageHeaderComponent],
  templateUrl: './hierarchy-page.component.html',
  styleUrl: './hierarchy-page.component.scss'
})
export class HierarchyPageComponent implements OnInit {
  private readonly initiativeDialog = viewChild.required<ElementRef<HTMLDialogElement>>('initiativeDialog');
  private readonly epicDialog = viewChild.required<ElementRef<HTMLDialogElement>>('epicDialog');
  private readonly confirm = viewChild.required(ConfirmDialogComponent);
  private readonly fb = inject(UntypedFormBuilder);
  readonly service = inject(HIERARCHY_SERVICE);
  readonly pending = signal(false);
  readonly initiativeId = signal<string | null>(null);
  readonly epicId = signal<string | null>(null);
  readonly initiativeForm = this.fb.group({ name: ['', Validators.required], description: ['', Validators.required] });
  readonly epicForm = this.fb.group({ initiativeId: ['', Validators.required], name: ['', Validators.required], summary: ['', Validators.required] });

  ngOnInit(): void { void this.service.load(); }

  openInitiative(initiative?: InitiativeHierarchy): void {
    this.initiativeId.set(initiative?.id ?? null);
    this.initiativeForm.reset({ name: initiative?.name ?? '', description: initiative?.description ?? '' });
    this.initiativeDialog().nativeElement.showModal();
  }

  openEpic(initiativeId: string, epic?: EpicHierarchy): void {
    this.epicId.set(epic?.id ?? null);
    this.epicForm.reset({ initiativeId, name: epic?.name ?? '', summary: epic?.summary ?? '' });
    this.epicDialog().nativeElement.showModal();
  }

  async saveInitiative(): Promise<void> {
    if (this.initiativeForm.invalid) { this.initiativeForm.markAllAsTouched(); return; }
    this.pending.set(true);
    const value = this.initiativeForm.getRawValue();
    const saved = await this.service.saveInitiative(this.initiativeId(), value.name, value.description);
    this.pending.set(false);
    if (saved) this.initiativeDialog().nativeElement.close();
  }

  async saveEpic(): Promise<void> {
    if (this.epicForm.invalid) { this.epicForm.markAllAsTouched(); return; }
    this.pending.set(true);
    const value = this.epicForm.getRawValue();
    const saved = await this.service.saveEpic(this.epicId(), value.initiativeId, value.name, value.summary);
    this.pending.set(false);
    if (saved) this.epicDialog().nativeElement.close();
  }

  async deleteInitiative(initiative: InitiativeHierarchy): Promise<void> {
    if (await this.confirm().open(`Delete ${initiative.name}?`, 'The initiative can be deleted only after all of its epics have been moved or removed.', 'Delete initiative')) {
      await this.service.deleteInitiative(initiative.id);
    }
  }

  async deleteEpic(epic: EpicHierarchy): Promise<void> {
    if (await this.confirm().open(`Delete ${epic.name}?`, 'The epic can be deleted only when it contains no stories.', 'Delete epic')) {
      await this.service.deleteEpic(epic.id);
    }
  }
}
