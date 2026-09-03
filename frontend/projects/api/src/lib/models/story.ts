import { StoryTask } from './story-task';

export interface Story {
  readonly id: string;
  readonly key: string;
  readonly epicId: string;
  readonly epicName: string;
  readonly initiativeName: string;
  readonly title: string;
  readonly description: string;
  readonly acceptanceCriteria: string;
  readonly points: number | null;
  readonly assistantId: string | null;
  readonly assistantName: string | null;
  readonly lifecycle: 'draft' | 'active' | 'archived';
  readonly isReady: boolean;
  readonly sprintId: string | null;
  readonly sprintName: string | null;
  readonly sprintStatus: 'planned' | 'active' | 'completed' | null;
  readonly boardStatus: 'toDo' | 'inProgress' | 'done';
  readonly tasks: readonly StoryTask[];
}
