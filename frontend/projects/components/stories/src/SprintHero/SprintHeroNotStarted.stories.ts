import type { StoryObj } from '@storybook/angular';

import type { SprintHeroComponent } from '@qbc/components';

export const NotStarted: StoryObj<SprintHeroComponent> = {
  render: () => ({
    template: `
      <qbc-sprint-hero
        eyebrow="Next sprint"
        goal="Epic roll-up reporting"
        dates="Oct 27 – Nov 7, 2026"
        [complete]="0"
        [total]="0"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'With no stories (`total` of 0) the percentage reads 0% rather than dividing by zero.',
      },
    },
  },
};
