import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  ButtonComponent,
  DialogComponent,
  FormErrorComponent,
  LoadingStateComponent,
  PageHeaderComponent,
  SectionLabelComponent,
  SegmentedComponent,
  SegmentedOption,
  SelectComponent,
  SelectOption,
  SelectValue,
  TextInputComponent,
} from '@qbc/components';
import { HIERARCHY_SERVICE } from '../hierarchy/hierarchy.service.contract';
import { BriefEditorComponent } from './editor/brief-editor.component';
import { BriefEditorAdapter } from './editor/brief-editor-adapter';
import { BRIEF_SNIPPETS, BRIEF_TEMPLATE } from './markdown/brief-snippets';
import { INITIATIVE_BRIEF_SERVICE } from './initiative-brief.service.contract';
import { MARKDOWN_COMMANDS, insertBlock } from './markdown/markdown-commands';
import { readOutline } from './markdown/read-outline';
import { renderMarkdown } from './markdown/render-markdown';
import { BriefView } from './brief-view';
import { FormattingTool } from './formatting-tool';

const VIEWS: readonly SegmentedOption[] = [
  { value: 'write', label: 'Write', title: 'Write only (Alt+1)' },
  { value: 'split', label: 'Split', title: 'Split (Alt+2)' },
  { value: 'preview', label: 'Preview', title: 'Preview only (Alt+3)' },
];

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

/**
 * The outcome brief for one initiative, written as markdown. The page owns the draft; nothing is
 * persisted until the writer saves, and nothing is written to browser storage, so an unsaved brief
 * lives only for as long as the page does.
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
    SectionLabelComponent,
    SegmentedComponent,
    SelectComponent,
    TextInputComponent,
  ],
  templateUrl: './initiative-brief-page.component.html',
  styleUrl: './initiative-brief-page.component.scss',
})
export class InitiativeBriefPageComponent {
  private readonly guardDialog = viewChild.required<DialogComponent>('guardDialog');
  private readonly editor = viewChild(BriefEditorComponent);
  private readonly router = inject(Router);
  private readonly service = inject(INITIATIVE_BRIEF_SERVICE);
  readonly hierarchyService = inject(HIERARCHY_SERVICE);

  readonly initiativeId = input.required<string>();
  readonly views = VIEWS;
  readonly tools = TOOLS;
  readonly buildingBlocks: readonly SelectOption[] = [
    { value: null, label: 'Insert…' },
    ...BRIEF_SNIPPETS.map((snippet) => ({ value: snippet.key, label: snippet.label })),
  ];

  readonly view = signal<BriefView>('write');
  readonly draftName = signal('');
  readonly draftBrief = signal('');
  readonly cursorLine = signal(1);
  readonly pending = signal(false);
  readonly formError = signal('');
  private adapter: BriefEditorAdapter | null = null;
  private resolveGuard: ((leave: boolean) => void) | null = null;

  readonly loadingState = this.service.loadingState;
  readonly error = this.service.error;
  readonly initiative = this.service.initiative;

  readonly dirty = computed(() => {
    const saved = this.initiative();
    if (saved === null) return false;
    return this.draftName() !== saved.name || this.draftBrief() !== saved.description;
  });

  readonly isEmpty = computed(() => this.draftBrief().trim().length === 0);
  readonly rendered = computed(() => renderMarkdown(this.draftBrief()));
  readonly outline = computed(() => readOutline(this.draftBrief()));
  readonly wordCount = computed(() => {
    const brief = this.draftBrief().trim();
    return brief.length === 0 ? 0 : brief.split(/\s+/).length;
  });
  readonly characterCount = computed(() => this.draftBrief().length);
  readonly readingTime = computed(() => {
    const words = this.wordCount();
    return words < 60 ? 'under a minute to read' : `about ${Math.ceil(words / 200)} min to read`;
  });
  readonly currentHeadingId = computed(() => {
    const line = this.cursorLine();
    let current = '';
    for (const heading of this.outline()) if (heading.line <= line) current = heading.id;
    return current;
  });
  readonly engineNote = computed(() => {
    const engine = this.editor()?.engine() ?? 'loading';
    if (engine === 'monaco') return 'Code editor';
    return engine === 'textarea' ? 'Plain field' : 'Loading…';
  });

  constructor() {
    effect(() => void this.service.load(this.initiativeId()));
    effect(() => void this.hierarchyService.load());
    effect(() => {
      const saved = this.initiative();
      if (saved === null || saved.id !== this.initiativeId()) return;
      this.draftName.set(saved.name);
      this.draftBrief.set(saved.description);
      this.adapter?.setValue(saved.description);
    });
  }

  onEditorReady(adapter: BriefEditorAdapter): void {
    this.adapter = adapter;
    adapter.onChange(() => this.draftBrief.set(adapter.getValue()));
    adapter.onCursor((offset) => this.cursorLine.set(adapter.positionAt(offset).line));
    const saved = this.initiative();
    if (saved !== null) adapter.setValue(saved.description);
  }

  runCommand(command: string): void {
    const transform = MARKDOWN_COMMANDS[command];
    if (transform === undefined || this.adapter === null) return;
    this.adapter.apply(transform(this.adapter.getState()));
  }

  insertBuildingBlock(key: SelectValue): void {
    const snippet = BRIEF_SNIPPETS.find((item) => item.key === key);
    if (snippet === undefined || this.adapter === null) return;
    const state = this.adapter.getState();
    this.adapter.apply(insertBlock(state.text, state.start, state.end, snippet.body));
  }

  insertTemplate(): void {
    if (this.adapter === null) return;
    this.adapter.setValue(BRIEF_TEMPLATE);
    this.draftBrief.set(BRIEF_TEMPLATE);
  }

  goToHeading(id: string, line: number): void {
    if (this.view() === 'preview') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    this.adapter?.revealLine(line);
  }

  showView(view: string): void {
    this.view.set(view as BriefView);
    if (view !== 'preview') setTimeout(() => this.adapter?.layout(), 0);
  }

  async save(): Promise<boolean> {
    const missing: string[] = [];
    if (!this.draftName().trim()) missing.push('Initiative name');
    if (!this.draftBrief().trim()) missing.push('Outcome brief');
    if (missing.length > 0) {
      this.formError.set(`These fields need a value: ${missing.join(', ')}.`);
      return false;
    }

    this.formError.set('');
    this.pending.set(true);
    const saved = await this.service.save(
      this.initiativeId(),
      this.draftName().trim(),
      this.draftBrief(),
    );
    this.pending.set(false);
    return saved;
  }

  discard(): void {
    const saved = this.initiative();
    if (saved === null) return;
    this.draftName.set(saved.name);
    this.draftBrief.set(saved.description);
    this.adapter?.setValue(saved.description);
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
    const saved = await this.save();
    if (saved) this.settleGuard(true);
  }

  /** Switching briefs stays on the same route, so the dirty check is made here rather than by the guard. */
  async openBrief(id: string): Promise<void> {
    if (id === this.initiativeId()) return;
    if (!(await this.confirmLeaving())) return;
    await this.router.navigate(['/initiatives', id, 'brief']);
  }

  summarise(description: string): string {
    const prose = description
      .split('\n')
      .find((line) => line.trim() && !/^[#>|]/.test(line.trim()));
    return prose === undefined ? 'No brief written yet.' : prose.replace(/[*_`]/g, '');
  }

  /** Escape or the close control means the writer is staying with the brief. */
  onGuardDismissed(): void {
    const resolve = this.resolveGuard;
    this.resolveGuard = null;
    resolve?.(false);
  }

  private settleGuard(leave: boolean): void {
    const resolve = this.resolveGuard;
    this.resolveGuard = null;
    this.guardDialog().close();
    resolve?.(leave);
  }
}
