export interface TimeEntry {
  readonly id: string;
  readonly storyId: string;
  readonly storyKey: string;
  readonly assistantId: string;
  readonly assistantName: string;
  readonly workedOn: string;
  readonly hours: number;
  readonly note: string;
}
