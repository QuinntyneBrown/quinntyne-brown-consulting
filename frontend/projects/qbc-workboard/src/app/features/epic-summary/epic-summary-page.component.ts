import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  BackLinkComponent,
  ButtonComponent,
  FormErrorComponent,
  LoadingStateComponent,
  PageHeaderComponent,
  SelectComponent,
  SelectOption,
  TextInputComponent,
} from '@qbc/components';
import { AttachmentsPanelComponent } from '../attachments/attachments-panel.component';
import { HIERARCHY_SERVICE } from '../hierarchy/hierarchy.service.contract';
import { DocumentEditorComponent } from '../markdown-document/document-editor.component';
import { EditsADocument } from '../markdown-document/unsaved-document.guard';
import { UnsavedChangesDialogComponent } from '../markdown-document/unsaved-changes-dialog.component';
import { EPIC_SUMMARY_SERVICE } from './epic-summary.service.contract';
import { EpicDraft } from './epic-draft';

/**
 * The one surface an epic is written on. It carries the parent initiative, the name, and the
 * summary together, whether the epic is being created or edited, because they are saved as one
 * record. An epic has no house shape to start from, so a new summary opens empty and says so.
 */
@Component({
  selector: 'app-epic-summary-page',
  imports: [
    AttachmentsPanelComponent,
    BackLinkComponent,
    ButtonComponent,
    DocumentEditorComponent,
    FormErrorComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    SelectComponent,
    TextInputComponent,
    UnsavedChangesDialogComponent,
  ],
  templateUrl: './epic-summary-page.component.html',
  styleUrl: './epic-summary-page.component.scss',
})
export class EpicSummaryPageComponent implements EditsADocument {
  private readonly guardDialog = viewChild.required(UnsavedChangesDialogComponent);
  private readonly editor = viewChild.required(DocumentEditorComponent);
  private readonly router = inject(Router);
  private readonly service = inject(EPIC_SUMMARY_SERVICE);
  private readonly hierarchyService = inject(HIERARCHY_SERVICE);

  /** Absent on the create route, where there is no epic to read yet. */
  readonly epicId = input<string>();
  /** Carried on the create route by the initiative the epic is being added to. */
  readonly initiativeId = input<string>();

  readonly draftInitiativeId = signal('');
  readonly draftName = signal('');
  readonly draftSummary = signal('');
  readonly pending = signal(false);
  readonly formError = signal('');
  /** The epic as it was last saved, which unsaved changes are measured against. */
  private readonly baseline = signal<EpicDraft>({ initiativeId: '', name: '', summary: '' });
  private resolveGuard: ((leave: boolean) => void) | null = null;

  readonly loadingState = this.service.loadingState;
  readonly error = this.service.error;

  readonly isNew = computed(() => this.epicId() === undefined);
  readonly title = computed(() => (this.isNew() ? 'New epic' : 'Edit epic'));

  readonly dirty = computed(() => {
    const saved = this.baseline();
    return (
      this.draftInitiativeId() !== saved.initiativeId ||
      this.draftName() !== saved.name ||
      this.draftSummary() !== saved.summary
    );
  });

  readonly initiativeOptions = computed<readonly SelectOption<string>[]>(() => [
    { value: '', label: 'Choose an initiative' },
    ...this.hierarchyService
      .hierarchy()
      .initiatives.map((initiative) => ({ value: initiative.id, label: initiative.name })),
  ]);

  constructor() {
    // The select names every initiative, so the hierarchy is read even on the create route.
    effect(() => void this.hierarchyService.load());
    effect(() => {
      const id = this.epicId();
      if (id !== undefined) void this.service.load(id);
    });
    effect(() => {
      // A new epic is parented by the initiative it was started from, and nothing else.
      if (this.epicId() !== undefined) return;
      this.reset({ initiativeId: this.initiativeId() ?? '', name: '', summary: '' });
    });
    effect(() => {
      const saved = this.service.epic();
      if (saved === null || saved.id !== this.epicId()) return;
      this.reset({
        initiativeId: saved.initiativeId,
        name: saved.name,
        summary: saved.summary,
      });
    });
  }

  /**
   * Saving a new epic normally moves the page onto the address it was given. A save made on the way
   * out must not: starting a navigation of its own would cancel the one the writer asked for and
   * strand them here.
   */
  async save({ address = true } = {}): Promise<boolean> {
    const missing: string[] = [];
    if (!this.draftInitiativeId()) missing.push('Initiative');
    if (!this.draftName().trim()) missing.push('Epic name');
    if (!this.draftSummary().trim()) missing.push('Summary');
    if (missing.length > 0) {
      this.formError.set(`These fields need a value: ${missing.join(', ')}.`);
      return false;
    }

    this.formError.set('');
    this.pending.set(true);
    const initiativeId = this.draftInitiativeId();
    const name = this.draftName().trim();
    const summary = this.draftSummary();
    const id = this.epicId();
    const saved =
      id === undefined
        ? await this.service.create(initiativeId, name, summary)
        : await this.service.save(id, initiativeId, name, summary);
    this.pending.set(false);
    if (saved === null) return false;

    // The baseline moves before the navigation, so the page's own success cannot trip the guard.
    this.baseline.set({
      initiativeId: saved.initiativeId,
      name: saved.name,
      summary: saved.summary,
    });
    this.draftName.set(saved.name);
    if (id === undefined && address) {
      await this.router.navigate(['/epics', saved.id], { replaceUrl: true });
    }
    return true;
  }

  discard(): void {
    this.reset(this.baseline());
    this.formError.set('');
  }

  /** Any navigation that would lose unsaved work asks first. */
  confirmLeaving(): Promise<boolean> {
    if (!this.dirty()) return Promise.resolve(true);
    this.guardDialog().open();
    return new Promise<boolean>((resolve) => {
      this.resolveGuard = resolve;
    });
  }

  keepEditing(): void {
    this.settleGuard(false);
  }

  discardAndLeave(): void {
    this.discard();
    this.settleGuard(true);
  }

  async saveAndLeave(): Promise<void> {
    if (await this.save({ address: false })) this.settleGuard(true);
  }

  /** Escape or the close control means the writer is staying with the summary. */
  onGuardDismissed(): void {
    const resolve = this.resolveGuard;
    this.resolveGuard = null;
    resolve?.(false);
  }

  private reset(draft: EpicDraft): void {
    this.baseline.set(draft);
    this.draftInitiativeId.set(draft.initiativeId);
    this.draftName.set(draft.name);
    this.editor().write(draft.summary);
  }

  private settleGuard(leave: boolean): void {
    const resolve = this.resolveGuard;
    this.resolveGuard = null;
    this.guardDialog().close();
    resolve?.(leave);
  }
}
