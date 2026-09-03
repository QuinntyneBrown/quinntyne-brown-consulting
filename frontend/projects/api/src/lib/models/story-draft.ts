export interface StoryDraft {
  readonly epicId: string;
  readonly title: string;
  readonly description: string;
  readonly acceptanceCriteria: string;
  readonly points: number | null;
  readonly assistantId: string | null;
  readonly tasks: readonly {
    readonly id: string | null;
    readonly title: string;
    readonly isComplete: boolean;
    readonly assistantId: string | null;
  }[];
}
