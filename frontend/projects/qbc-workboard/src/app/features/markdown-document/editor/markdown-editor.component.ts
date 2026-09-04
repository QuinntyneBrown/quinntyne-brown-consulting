import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormErrorComponent, LoadingStateComponent } from '@qbc/components';
import { MarkdownEditorHandle } from './markdown-editor-handle';
import { MarkdownEditorState } from './markdown-editor-state';
import { createMonacoEditor } from './create-monaco-editor';

/**
 * Carries the markdown source of a document in the code editor. A document is markdown whichever
 * way it is written, so there is no second, plainer control to fall back to: an editor that cannot
 * be loaded says so rather than quietly offering a lesser surface.
 */
@Component({
  selector: 'app-markdown-editor',
  imports: [FormErrorComponent, LoadingStateComponent],
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.scss',
})
export class MarkdownEditorComponent implements AfterViewInit, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  readonly initialValue = input('');
  /** Names the source for a screen reader, so each record says which document is being written. */
  readonly ariaLabel = input.required<string>();
  readonly ready = output<MarkdownEditorHandle>();
  readonly state = signal<MarkdownEditorState>('loading');
  private handle: MarkdownEditorHandle | null = null;

  async ngAfterViewInit(): Promise<void> {
    try {
      this.handle = await createMonacoEditor(
        this.host().nativeElement,
        this.initialValue(),
        this.ariaLabel(),
      );
      this.state.set('ready');
      this.ready.emit(this.handle);
    } catch {
      // Either the editor module or its stylesheet never arrived. The document cannot be written
      // without them, so the page reports that rather than presenting an unusable surface.
      this.state.set('failed');
    }
  }

  ngOnDestroy(): void {
    this.handle?.dispose();
  }
}
