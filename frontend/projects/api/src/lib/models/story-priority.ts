/** The scale a story's priority is drawn from, in ascending order of urgency. */
export type StoryPriority =
  'none' | 'veryLow' | 'low' | 'medium' | 'high' | 'veryHigh' | 'critical';

/** Ascending, so a priority's index is its rank. */
export const STORY_PRIORITY_ORDER: readonly StoryPriority[] = [
  'none',
  'veryLow',
  'low',
  'medium',
  'high',
  'veryHigh',
  'critical',
];

export const STORY_PRIORITY_LABELS: Readonly<Record<StoryPriority, string>> = {
  none: 'None',
  veryLow: 'Very low',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  veryHigh: 'Very high',
  critical: 'Critical',
};

export function isStoryPriority(value: unknown): value is StoryPriority {
  return typeof value === 'string' && (STORY_PRIORITY_ORDER as readonly string[]).includes(value);
}

/** Higher is more urgent. */
export function storyPriorityRank(priority: StoryPriority): number {
  return STORY_PRIORITY_ORDER.indexOf(priority);
}
