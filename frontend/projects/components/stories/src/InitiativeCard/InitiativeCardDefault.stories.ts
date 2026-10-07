import type { StoryObj } from '@storybook/angular';

import type { InitiativeCardComponent } from '@qbc/components';

export const Default: StoryObj<InitiativeCardComponent> = {
  args: {
    title: 'Self-serve onboarding',
    description: 'Let new clients set up their workboard without a kickoff call.',
    summary: '3 epics · 14 stories · 42 story points',
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-initiative-card [title]="title" [description]="description" [summary]="summary">
        <p>Epics for this initiative appear here.</p>
      </qbc-initiative-card>
    `,
  }),
};
