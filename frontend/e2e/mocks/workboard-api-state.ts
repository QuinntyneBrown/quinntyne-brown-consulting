import type { Assistant, Epic, Initiative, Sprint, Story } from '@qbc/api';

export interface WorkboardApiState {
  readonly assistants: Assistant[];
  readonly initiatives: Initiative[];
  readonly epics: Epic[];
  readonly sprints: Sprint[];
  readonly stories: Story[];
  nextStoryNumber: number;
  nextEntityNumber: number;
}
