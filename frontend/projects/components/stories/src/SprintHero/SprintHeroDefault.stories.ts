import type { StoryObj } from '@storybook/angular';

import type { SprintHeroComponent } from '@qbc/components';

export const Default: StoryObj<SprintHeroComponent> = {
  args: {
    eyebrow: 'Current sprint',
    goal: 'Ship the backlog import and story-point forecasting',
    dates: 'Sep 29 – Oct 10, 2026',
    complete: 7,
    total: 12,
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-sprint-hero
        [eyebrow]="eyebrow"
        [goal]="goal"
        [dates]="dates"
        [complete]="complete"
        [total]="total"
      />
    `,
  }),
};
