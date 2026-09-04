import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LoadingStateComponent, TextareaComponent } from '@qbc/components';
import { BriefEditorAdapter } from './brief-editor-adapter';
import { BriefEditorEngine } from './brief-editor-engine';
import { createMonacoEditor } from './create-monaco-editor';
import { createTextareaEditor } from './create-textarea-editor';

/**
 * Carries the markdown source of a brief. It prefers the code editor and falls back to a plain
 * markdown field when that editor cannot be loaded, reporting either through one adapter so the
 * rest of the page never learns which one is on screen.
 */
@Component({
  selector: 'app-brief-editor',
  imports: [LoadingStateComponent, TextareaComponent],
  templateUrl: './brief-editor.component.html',
  styleUrl: './brief-editor.component.scss',
})
export class BriefEditorComponent implements AfterViewInit, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly fallback = viewChild('fallback', { read: ElementRef });
  readonly initialValue = input('');
  readonly ready = output<BriefEditorAdapter>();
  readonly engine = signal<BriefEditorEngine>('loading');
  private adapter: BriefEditorAdapter | null = null;

  constructor() {
    effect(() => {
      const element = this.fallback();
      if (this.adapter !== null || element === undefined) return;
      const area = (element.nativeElement as HTMLElement).querySelector('textarea');
      if (area !== null) this.attach(createTextareaEditor(area));
    });
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      const monaco = await createMonacoEditor(this.host().nativeElement, this.initialValue());
      this.engine.set('monaco');
      this.attach(monaco);
    } catch {
      // The code editor could not be loaded. The brief stays writable as plain markdown, and the
      // effect above attaches the field once it has rendered.
      this.engine.set('textarea');
    }
  }

  ngOnDestroy(): void {
    this.adapter?.dispose();
  }

  private attach(adapter: BriefEditorAdapter): void {
    this.adapter = adapter;
    this.ready.emit(adapter);
  }
}
