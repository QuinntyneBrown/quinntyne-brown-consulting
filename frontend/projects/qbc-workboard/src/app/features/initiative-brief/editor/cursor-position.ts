/** Where the caret sits in the markdown source, as the status bar reports it. */
export interface CursorPosition {
  readonly line: number;
  readonly column: number;
}
