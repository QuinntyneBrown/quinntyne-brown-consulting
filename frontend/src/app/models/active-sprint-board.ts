import { SprintStoryCard } from './sprint-story-card';

export interface ActiveSprintBoard {
  readonly sprintId: string;
  readonly name: string;
  readonly goal: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly doneCount: number;
  readonly totalCount: number;
  readonly completionPercentage: number;
  readonly stories: readonly SprintStoryCard[];
}
