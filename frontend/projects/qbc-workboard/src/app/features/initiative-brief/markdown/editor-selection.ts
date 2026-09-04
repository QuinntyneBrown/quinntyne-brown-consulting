/** The markdown source and the selection a command acts on, as both editors express it. */
export interface EditorSelection {
  readonly text: string;
  readonly start: number;
  readonly end: number;
}
