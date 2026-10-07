import type { StoryObj } from '@storybook/angular';

import type { SprintRowComponent } from '@qbc/components';

export const Default: StoryObj<SprintRowComponent> = {
  args: {
    name: 'Sprint 14',
    status: 'active',
    goal: 'Ship the backlog import and story-point forecasting',
    meta: 'Sep 29 – Oct 10 · 12 stories · 34 points',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['planned', 'active', 'completed', 'archived', 'draft'],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-sprint-row [name]="name" [status]="status" [goal]="goal" [meta]="meta" />
    `,
  }),
};
