import type { Assistant, DeploymentVersion, Epic, Initiative, Sprint, Story } from '@qbc/api';
import type { WorkboardApiFault } from './workboard-api-fault';

export interface WorkboardApiState {
  passcode: string;
  readonly deployment: DeploymentVersion;
  readonly assistants: Assistant[];
  readonly initiatives: Initiative[];
  readonly epics: Epic[];
  readonly sprints: Sprint[];
  readonly stories: Story[];
  readonly fault: WorkboardApiFault;
  nextStoryNumber: number;
  nextEntityNumber: number;
}
