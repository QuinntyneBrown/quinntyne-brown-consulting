import type { StoryObj } from '@storybook/angular';

import type { EmptyStateComponent } from '@qbc/components';

export const Subtitle: StoryObj<EmptyStateComponent> = {
  render: () => ({
    template: `
      <qbc-empty-state
        icon="board"
        title="No active sprint"
        subtitle="Start a planned sprint to bring Ready stories onto the board."
      >
        <qbc-button actions>Choose a sprint</qbc-button>
      </qbc-empty-state>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`subtitle` and `description` are interchangeable; `subtitle` wins when both are set.',
      },
    },
  },
};
