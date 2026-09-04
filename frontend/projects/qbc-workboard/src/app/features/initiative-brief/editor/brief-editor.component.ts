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
import { BriefEditorHandle } from './brief-editor-handle';
import { BriefEditorState } from './brief-editor-state';
import { createMonacoEditor } from './create-monaco-editor';

/**
 * Carries the markdown source of a brief in the code editor. A brief is markdown whichever way it
 * is written, so there is no second, plainer control to fall back to: an editor that cannot be
 * loaded says so rather than quietly offering a lesser surface.
 */
@Component({
  selector: 'app-brief-editor',
  imports: [FormErrorComponent, LoadingStateComponent],
  templateUrl: './brief-editor.component.html',
  styleUrl: './brief-editor.component.scss',
})
export class BriefEditorComponent implements AfterViewInit, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  readonly initialValue = input('');
  readonly ready = output<BriefEditorHandle>();
  readonly state = signal<BriefEditorState>('loading');
  private handle: BriefEditorHandle | null = null;

  async ngAfterViewInit(): Promise<void> {
    try {
      this.handle = await createMonacoEditor(this.host().nativeElement, this.initialValue());
      this.state.set('ready');
      this.ready.emit(this.handle);
    } catch {
      // Either the editor module or its stylesheet never arrived. The brief cannot be written
      // without them, so the page reports that rather than presenting an unusable surface.
      this.state.set('failed');
    }
  }

  ngOnDestroy(): void {
    this.handle?.dispose();
  }
}
