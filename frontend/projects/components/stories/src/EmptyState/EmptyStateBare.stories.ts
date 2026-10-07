import type { StoryObj } from '@storybook/angular';

import type { EmptyStateComponent } from '@qbc/components';

export const Bare: StoryObj<EmptyStateComponent> = {
  render: () => ({
    template: `
      <qbc-empty-state
        [bare]="true"
        title="No sprints yet"
        description="Create a sprint and give it a delivery goal."
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '`bare` drops the dashed frame for use inside a card, list or dialog.',
      },
    },
  },
};
