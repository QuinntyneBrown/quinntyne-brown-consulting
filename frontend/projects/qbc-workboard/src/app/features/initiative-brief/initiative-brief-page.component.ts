import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  BackLinkComponent,
  ButtonComponent,
  FormErrorComponent,
  LoadingStateComponent,
  PageHeaderComponent,
  TextInputComponent,
} from '@qbc/components';
import { DocumentEditorComponent } from '../markdown-document/document-editor.component';
import { EditsADocument } from '../markdown-document/unsaved-document.guard';
import { UnsavedChangesDialogComponent } from '../markdown-document/unsaved-changes-dialog.component';
import { BRIEF_TEMPLATE } from './brief-template';
import { INITIATIVE_BRIEF_SERVICE } from './initiative-brief.service.contract';
import { InitiativeDraft } from './initiative-draft';

/**
 * What a brief that has never been written starts from. A new initiative opens on an empty
 * document, so the first words in it are the writer's; the house shape stays one click away in the
 * empty state for a writer who wants it.
 */
const NEW_INITIATIVE: InitiativeDraft = { name: '', description: '' };

/**
 * The one surface an initiative is written on. It carries the name and the outcome brief together,
 * whether the initiative is being created or edited, because they are saved as one record. The page
 * owns the draft; nothing is persisted until the writer saves, and nothing is written to browser
 * storage, so an unsaved brief lives only for as long as the page does.
 */
@Component({
  selector: 'app-initiative-brief-page',
  imports: [
    BackLinkComponent,
    ButtonComponent,
    DocumentEditorComponent,
    FormErrorComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    TextInputComponent,
    UnsavedChangesDialogComponent,
  ],
  templateUrl: './initiative-brief-page.component.html',
  styleUrl: './initiative-brief-page.component.scss',
})
export class InitiativeBriefPageComponent implements EditsADocument {
  private readonly guardDialog = viewChild.required(UnsavedChangesDialogComponent);
  private readonly editor = viewChild.required(DocumentEditorComponent);
  private readonly router = inject(Router);
  private readonly service = inject(INITIATIVE_BRIEF_SERVICE);

  /** Absent on the create route, where there is no initiative to read yet. */
  readonly initiativeId = input<string>();
  readonly briefTemplate = BRIEF_TEMPLATE;

  readonly draftName = signal(NEW_INITIATIVE.name);
  readonly draftBrief = signal(NEW_INITIATIVE.description);
  readonly pending = signal(false);
  readonly formError = signal('');
  /**
   * The initiative as it was last saved, which unsaved changes are measured against. A new
   * initiative starts empty, so opening the create route and leaving again asks nothing.
   */
  private readonly baseline = signal<InitiativeDraft>(NEW_INITIATIVE);
  private resolveGuard: ((leave: boolean) => void) | null = null;

  readonly loadingState = this.service.loadingState;
  readonly error = this.service.error;

  readonly isNew = computed(() => this.initiativeId() === undefined);
  readonly title = computed(() => (this.isNew() ? 'New initiative' : 'Edit initiative'));

  readonly dirty = computed(
    () =>
      this.draftName() !== this.baseline().name ||
      this.draftBrief() !== this.baseline().description,
  );

  constructor() {
    effect(() => {
      const id = this.initiativeId();
      if (id !== undefined) void this.service.load(id);
    });
    effect(() => {
      const saved = this.service.initiative();
      if (saved === null || saved.id !== this.initiativeId()) return;
      this.reset({ name: saved.name, description: saved.description });
    });
  }

  /**
   * Saving a new initiative normally moves the page onto the address it was given. A save made on
   * the way out must not: starting a navigation of its own would cancel the one the writer asked
   * for and strand them here.
   */
  async save({ address = true } = {}): Promise<boolean> {
    const missing: string[] = [];
    if (!this.draftName().trim()) missing.push('Initiative name');
    if (!this.draftBrief().trim()) missing.push('Outcome brief');
    if (missing.length > 0) {
      this.formError.set(`These fields need a value: ${missing.join(', ')}.`);
      return false;
    }

    this.formError.set('');
    this.pending.set(true);
    const name = this.draftName().trim();
    const brief = this.draftBrief();
    const id = this.initiativeId();
    const saved =
      id === undefined
        ? await this.service.create(name, brief)
        : await this.service.save(id, name, brief);
    this.pending.set(false);
    if (saved === null) return false;

    // The baseline moves before the navigation, so the page's own success cannot trip the guard.
    this.baseline.set({ name: saved.name, description: saved.description });
    this.draftName.set(saved.name);
    if (id === undefined && address) {
      await this.router.navigate(['/initiatives', saved.id], { replaceUrl: true });
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

  /** Escape or the close control means the writer is staying with the brief. */
  onGuardDismissed(): void {
    const resolve = this.resolveGuard;
    this.resolveGuard = null;
    resolve?.(false);
  }

  private reset(draft: InitiativeDraft): void {
    this.baseline.set(draft);
    this.draftName.set(draft.name);
    this.editor().write(draft.description);
  }

  private settleGuard(leave: boolean): void {
    const resolve = this.resolveGuard;
    this.resolveGuard = null;
    this.guardDialog().close();
    resolve?.(leave);
  }
}
