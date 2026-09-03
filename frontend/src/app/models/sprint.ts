export interface Sprint {
  readonly id: string;
  readonly name: string;
  readonly goal: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly status: 'planned' | 'active' | 'completed';
  readonly storyCount: number;
  readonly storyKeys: readonly string[];
}

