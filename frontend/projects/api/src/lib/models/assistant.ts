import { AssignmentLink } from './assignment-link';

export interface Assistant {
  readonly id: string;
  readonly fullName: string;
  readonly role: string;
  readonly specialties: readonly string[];
  readonly availability: 'available' | 'limited' | 'unavailable';
  readonly storyCount: number;
  readonly incompleteTaskCount: number;
  readonly blockingAssignments: readonly AssignmentLink[];
}
