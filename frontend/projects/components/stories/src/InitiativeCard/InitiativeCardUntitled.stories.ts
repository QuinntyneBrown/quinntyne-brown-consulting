import type { StoryObj } from '@storybook/angular';

import type { InitiativeCardComponent } from '@qbc/components';

export const Untitled: StoryObj<InitiativeCardComponent> = {
  render: () => ({
    template: `<qbc-initiative-card />`,
  }),
  parameters: {
    docs: {
      description: {
        story: 'With no inputs the card falls back to "Untitled initiative" and empty copy.',
      },
    },
  },
};
