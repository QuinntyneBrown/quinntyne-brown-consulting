import {
  Component,
  HostListener,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ButtonComponent,
  DialogComponent,
  FormErrorComponent,
  LoadingStateComponent,
  PageHeaderComponent,
  SegmentedComponent,
  SegmentedOption,
  TextInputComponent,
} from '@qbc/components';
import { BriefEditorComponent } from './editor/brief-editor.component';
import { BriefEditorHandle } from './editor/brief-editor-handle';
import { BRIEF_TEMPLATE } from './markdown/brief-snippets';
import { INITIATIVE_BRIEF_SERVICE } from './initiative-brief.service.contract';
import { MARKDOWN_COMMANDS } from './markdown/markdown-commands';
import { renderMarkdown } from './markdown/render-markdown';
import { BriefView } from './brief-view';
import { FormattingTool } from './formatting-tool';
import { InitiativeDraft } from './initiative-draft';

const VIEWS: readonly SegmentedOption[] = [
  { value: 'write', label: 'Write', title: 'Write only (Alt+1)' },
  { value: 'split', label: 'Split', title: 'Split (Alt+2)' },
  { value: 'preview', label: 'Preview', title: 'Preview only (Alt+3)' },
];

const VIEW_KEYS: Readonly<Record<string, BriefView>> = {
  '1': 'write',
  '2': 'split',
  '3': 'preview',
};

const TOOLS: readonly FormattingTool[] = [
  { command: 'heading', label: 'H2', name: 'Heading' },
  { command: 'bold', label: 'B', name: 'Bold' },
  { command: 'italic', label: 'I', name: 'Italic' },
  { command: 'strike', label: 'S', name: 'Strikethrough' },
  { command: 'code', label: '</>', name: 'Inline code' },
  { command: 'link', label: '↗', name: 'Link' },
  { command: 'bullet', label: '•—', name: 'Bulleted list' },
  { command: 'ordered', label: '1.', name: 'Numbered list' },
  { command: 'task', label: '☑', name: 'Task list' },
  { command: 'quote', label: '❞', name: 'Quote' },
  { command: 'fence', label: '▤', name: 'Code block' },
  { command: 'table', label: '▦', name: 'Table' },
  { command: 'rule', label: '—', name: 'Divider' },
];

/** What a brief that has never been written starts from, so a new initiative opens structured. */
const NEW_INITIATIVE: InitiativeDraft = { name: '', description: BRIEF_TEMPLATE };

/**
 * The one surface an initiative is written on. It carries the name and the outcome brief together,
 * whether the initiative is being created or edited, because they are saved as one record. The page
 * owns the draft; nothing is persisted until the writer saves, and nothing is written to browser
 * storage, so an unsaved brief lives only for as long as the page does.
 */
@Component({
  selector: 'app-initiative-brief-page',
  imports: [
    BriefEditorComponent,
    ButtonComponent,
    DialogComponent,
    FormErrorComponent,
    LoadingStateComponent,
    PageHeaderComponent,
    RouterLink,
    SegmentedComponent,
    TextInputComponent,
  ],
  templateUrl: './initiative-brief-page.component.html',
  styleUrl: './initiative-brief-page.component.scss',
})
export class InitiativeBriefPageComponent {
  private readonly guardDialog = viewChild.required<DialogComponent>('guardDialog');
  private readonly router = inject(Router);
  private readonly service = inject(INITIATIVE_BRIEF_SERVICE);

  /** Absent on the create route, where there is no initiative to read yet. */
  readonly initiativeId = input<string>();
  readonly views = VIEWS;
  readonly tools = TOOLS;

  readonly view = signal<BriefView>('write');
  readonly draftName = signal(NEW_INITIATIVE.name);
  readonly draftBrief = signal(NEW_INITIATIVE.description);
  readonly pending = signal(false);
  readonly formError = signal('');
  /**
   * The initiative as it was last saved, which unsaved changes are measured against. A new
   * initiative starts from the template, so opening the create route and leaving again asks nothing.
   */
  private readonly baseline = signal<InitiativeDraft>(NEW_INITIATIVE);
  private editor: BriefEditorHandle | null = null;
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

  readonly isEmpty = computed(() => this.draftBrief().trim().length === 0);
  readonly rendered = computed(() => renderMarkdown(this.draftBrief()));
  readonly wordCount = computed(() => {
    const brief = this.draftBrief().trim();
    return brief.length === 0 ? 0 : brief.split(/\s+/).length;
  });
  readonly characterCount = computed(() => this.draftBrief().length);
  readonly readingTime = computed(() => {
    const words = this.wordCount();
    return words < 60 ? 'under a minute to read' : `about ${Math.ceil(words / 200)} min to read`;
  });

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

  /** The view switch advertises these on its own controls, so the page has to honour them. */
  @HostListener('document:keydown', ['$event'])
  onShortcut(event: KeyboardEvent): void {
    if (!event.altKey || event.ctrlKey || event.metaKey) return;
    const view = VIEW_KEYS[event.key];
    if (view === undefined) return;
    event.preventDefault();
    this.showView(view);
  }

  onEditorReady(editor: BriefEditorHandle): void {
    this.editor = editor;
    editor.onChange(() => this.draftBrief.set(editor.getValue()));
    editor.setValue(this.draftBrief());
  }

  runCommand(command: string): void {
    const transform = MARKDOWN_COMMANDS[command];
    if (transform === undefined || this.editor === null) return;
    this.editor.apply(transform(this.editor.getState()));
  }

  insertTemplate(): void {
    this.setBrief(BRIEF_TEMPLATE);
  }

  showView(view: string): void {
    this.view.set(view as BriefView);
    if (view !== 'preview') setTimeout(() => this.editor?.layout(), 0);
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
    this.setBrief(draft.description);
  }

  /**
   * Pushing a value the editor already holds would move the caret back to the top of the document,
   * which is what a save that changed nothing about the source would otherwise do to the writer.
   */
  private setBrief(markdown: string): void {
    this.draftBrief.set(markdown);
    if (this.editor !== null && this.editor.getValue() !== markdown) this.editor.setValue(markdown);
  }

  private settleGuard(leave: boolean): void {
    const resolve = this.resolveGuard;
    this.resolveGuard = null;
    this.guardDialog().close();
    resolve?.(leave);
  }
}
