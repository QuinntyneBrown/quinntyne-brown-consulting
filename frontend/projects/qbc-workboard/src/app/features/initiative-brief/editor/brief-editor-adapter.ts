import { EditorSelection } from '../markdown/editor-selection';
import { CursorPosition } from './cursor-position';

/**
 * What the brief editor needs from whichever control is carrying the markdown. The code editor and
 * the plain markdown field both satisfy it, so the toolbar, the outline, and the status bar are
 * written once and work against either.
 */
export interface BriefEditorAdapter {
  readonly kind: 'monaco' | 'textarea';
  getState(): EditorSelection;
  apply(next: EditorSelection): void;
  getValue(): string;
  setValue(text: string): void;
  focus(): void;
  revealLine(line: number): void;
  positionAt(offset: number): CursorPosition;
  onChange(handler: () => void): void;
  onCursor(handler: (offset: number) => void): void;
  layout(): void;
  dispose(): void;
}
