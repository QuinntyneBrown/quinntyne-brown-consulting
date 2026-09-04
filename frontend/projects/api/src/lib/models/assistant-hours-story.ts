import { Story } from './story';
import { TimeEntry } from './time-entry';

/** One story an assistant worked on, meaning one they have logged hours against. */
export interface AssistantHoursStory {
  readonly storyId: string;
  readonly storyKey: string;
  readonly title: string;
  readonly epicName: string;
  readonly boardStatus: Story['boardStatus'];
  readonly isComplete: boolean;
  readonly points: number | null;
  /** The reader's own hours on this story. */
  readonly hours: number;
  /** Every hour logged against the story, by anyone. */
  readonly storyHours: number;
  readonly entries: readonly TimeEntry[];
}
