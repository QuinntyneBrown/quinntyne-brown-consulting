import type { StoryObj } from '@storybook/angular';

import type { AssistantCardComponent } from '@qbc/components';

export const Unavailable: StoryObj<AssistantCardComponent> = {
  render: () => ({
    template: `
      <div style="max-width: 360px">
        <qbc-assistant-card name="Priya Shah" role="Research assistant" availability="unavailable" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'An unavailable assistant with no specialties and no assigned work.',
      },
    },
  },
};
