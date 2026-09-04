import { Assistant } from './assistant';
import { AssistantHoursStory } from './assistant-hours-story';

export interface AssistantHours {
  readonly assistantId: string;
  readonly fullName: string;
  readonly role: string;
  readonly specialties: readonly string[];
  readonly availability: Assistant['availability'];
  readonly hoursLogged: number;
  readonly hoursOnCompletedStories: number;
  readonly storiesWorkedOn: number;
  readonly completedStoriesWorkedOn: number;
  readonly stories: readonly AssistantHoursStory[];
}
