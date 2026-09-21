/**
 * One total across several stories. The order of `storyIds` matters: the first story receives
 * whatever is left after every story has taken its equal quarter-hour share.
 */
export interface TimeEntryBatchDraft {
  readonly storyIds: readonly string[];
  readonly assistantId: string;
  readonly workedOn: string;
  readonly totalHours: number;
  readonly note: string;
}
