import { EpicHierarchy } from './epic-hierarchy';

export interface InitiativeHierarchy {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly epicCount: number;
  readonly storyCount: number;
  readonly epics: readonly EpicHierarchy[];
}

