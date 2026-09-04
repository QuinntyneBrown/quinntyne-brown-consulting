/** An epic as the editor holds it: its parent, its name, and its summary, saved as one record. */
export interface EpicDraft {
  readonly initiativeId: string;
  readonly name: string;
  readonly summary: string;
}
