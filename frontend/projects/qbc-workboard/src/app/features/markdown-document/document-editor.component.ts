import { Component, HostListener, computed, model, input, signal, viewChild } from '@angular/core';
import { ButtonComponent, SegmentedComponent, SegmentedOption } from '@qbc/components';
import { MarkdownEditorComponent } from './editor/markdown-editor.component';
import { MarkdownEditorHandle } from './editor/markdown-editor-handle';
import { MARKDOWN_COMMANDS } from './markdown/markdown-commands';
import { renderMarkdown } from './markdown/render-markdown';
import { DocumentView } from './document-view';
import { FormattingTool } from './formatting-tool';

const VIEWS: readonly SegmentedOption[] = [
  { value: 'write', label: 'Write', title: 'Write only (Alt+1)' },
  { value: 'split', label: 'Split', title: 'Split (Alt+2)' },
  { value: 'preview', label: 'Preview', title: 'Preview only (Alt+3)' },
];

const VIEW_KEYS: Readonly<Record<string, DocumentView>> = {
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

/**
 * The surface a markdown document is written on: the fields that identify the record, a formatting
 * toolbar, the write, split, and preview views, and a report of the document's size. It owns how
 * the document is displayed and nothing about what the document belongs to, so an initiative and an
 * epic are written the same way without either page knowing about the other.
 */
@Component({
  selector: 'app-document-editor',
  imports: [ButtonComponent, MarkdownEditorComponent, SegmentedComponent],
  templateUrl: './document-editor.component.html',
  styleUrl: './document-editor.component.scss',
})
export class DocumentEditorComponent {
  private readonly editor = viewChild(MarkdownEditorComponent);

  /** The markdown source, owned by the page and written through here. */
  readonly value = model.required<string>();
  /** Names the source for a screen reader: "Initiative brief, markdown source", say. */
  readonly sourceLabel = input.required<string>();
  readonly emptyTitle = input.required<string>();
  readonly emptyHint = input.required<string>();
  /**
   * A starter the empty state offers. A record with no house shape supplies none, and the empty
   * state then explains itself without offering anything to insert.
   */
  readonly template = input<string>();
  readonly templateLabel = input('Insert the document template');

  readonly views = VIEWS;
  readonly tools = TOOLS;
  readonly view = signal<DocumentView>('write');
  private handle: MarkdownEditorHandle | null = null;

  readonly isEmpty = computed(() => this.value().trim().length === 0);
  readonly rendered = computed(() => renderMarkdown(this.value()));
  readonly wordCount = computed(() => {
    const source = this.value().trim();
    return source.length === 0 ? 0 : source.split(/\s+/).length;
  });
  readonly characterCount = computed(() => this.value().length);
  readonly readingTime = computed(() => {
    const words = this.wordCount();
    return words < 60 ? 'under a minute to read' : `about ${Math.ceil(words / 200)} min to read`;
  });

  /** The view switch advertises these on its own controls, so the editor has to honour them. */
  @HostListener('document:keydown', ['$event'])
  onShortcut(event: KeyboardEvent): void {
    if (!event.altKey || event.ctrlKey || event.metaKey) return;
    const view = VIEW_KEYS[event.key];
    if (view === undefined) return;
    event.preventDefault();
    this.showView(view);
  }

  onEditorReady(handle: MarkdownEditorHandle): void {
    this.handle = handle;
    handle.onChange(() => this.value.set(handle.getValue()));
    handle.setValue(this.value());
  }

  runCommand(command: string): void {
    const transform = MARKDOWN_COMMANDS[command];
    if (transform === undefined || this.handle === null) return;
    this.handle.apply(transform(this.handle.getState()));
  }

  insertTemplate(): void {
    const template = this.template();
    if (template !== undefined) this.write(template);
  }

  showView(view: string): void {
    this.view.set(view as DocumentView);
    if (view !== 'preview') setTimeout(() => this.handle?.layout(), 0);
  }

  /**
   * Puts a value into the editor from outside it — a load, a discard, or a template. Pushing a
   * value the editor already holds would move the caret back to the top of the document, which is
   * what a save that changed nothing about the source would otherwise do to the writer.
   */
  write(markdown: string): void {
    this.value.set(markdown);
    if (this.handle !== null && this.handle.getValue() !== markdown) this.handle.setValue(markdown);
  }

  /** Reports whether the code editor could be loaded, which a page names in its own words. */
  editorFailed(): boolean {
    return this.editor()?.state() === 'failed';
  }
}
