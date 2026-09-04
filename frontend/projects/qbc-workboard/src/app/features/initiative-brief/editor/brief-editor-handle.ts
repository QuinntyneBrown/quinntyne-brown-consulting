import { EditorSelection } from '../markdown/editor-selection';

/**
 * What the page needs from the control carrying the markdown. The code editor is the only thing
 * that satisfies it; the interface exists so the editor's own types stay inside this folder rather
 * than reaching the page, the toolbar, and the status bar.
 */
export interface BriefEditorHandle {
  getState(): EditorSelection;
  apply(next: EditorSelection): void;
  getValue(): string;
  setValue(text: string): void;
  focus(): void;
  onChange(handler: () => void): void;
  layout(): void;
  dispose(): void;
}
