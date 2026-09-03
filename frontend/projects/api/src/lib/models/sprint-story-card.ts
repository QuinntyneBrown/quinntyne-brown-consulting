export interface SprintStoryCard {
  readonly storyId: string;
  readonly key: string;
  readonly title: string;
  readonly epicName: string;
  readonly points: number | null;
  readonly assistantId: string | null;
  readonly assistantName: string | null;
  readonly completedTasks: number;
  readonly totalTasks: number;
  readonly boardStatus: 'toDo' | 'inProgress' | 'done';
}
