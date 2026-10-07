import type {
  Assistant,
  Attachment,
  DeploymentVersion,
  Epic,
  Initiative,
  Sprint,
  Story,
  TimeEntry,
} from '@qbc/api';
import type { WorkboardApiFault } from './workboard-api-fault';

export interface WorkboardApiState {
  passcode: string;
  readonly deployment: DeploymentVersion;
  readonly assistants: Assistant[];
  readonly attachments: Attachment[];
  readonly initiatives: Initiative[];
  readonly epics: Epic[];
  readonly sprints: Sprint[];
  readonly stories: Story[];
  readonly timeEntries: TimeEntry[];
  readonly fault: WorkboardApiFault;
  nextStoryNumber: number;
  nextEntityNumber: number;
}
