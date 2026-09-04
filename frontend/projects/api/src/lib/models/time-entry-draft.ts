/** What a writer supplies when recording time; everything else is derived from the records named. */
export interface TimeEntryDraft {
  readonly storyId: string;
  readonly assistantId: string;
  readonly workedOn: string;
  readonly hours: number;
  readonly note: string;
}
