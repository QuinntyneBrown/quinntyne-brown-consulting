/** One markdown formatting button: the command it runs, its glyph, and the name it is known by. */
export interface FormattingTool {
  readonly command: string;
  readonly label: string;
  readonly name: string;
}
