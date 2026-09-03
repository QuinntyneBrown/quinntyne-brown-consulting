export interface StoryTask {
  readonly id: string;
  readonly title: string;
  readonly isComplete: boolean;
  readonly assistantId: string | null;
  readonly assistantName: string | null;
}
