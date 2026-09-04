import type { Assistant, DeploymentVersion, Epic, Initiative, Sprint, Story } from '@qbc/api';

export interface WorkboardApiState {
  readonly passcode: string;
  readonly deployment: DeploymentVersion;
  readonly assistants: Assistant[];
  readonly initiatives: Initiative[];
  readonly epics: Epic[];
  readonly sprints: Sprint[];
  readonly stories: Story[];
  nextStoryNumber: number;
  nextEntityNumber: number;
}
