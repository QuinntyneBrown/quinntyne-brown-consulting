import type { StoryObj } from '@storybook/angular';

import type { ActionGroupComponent } from '@qbc/components';

export const Between: StoryObj<ActionGroupComponent> = {
  render: () => ({
    template: `
      <qbc-action-group align="between">
        <qbc-button variant="danger">Delete epic</qbc-button>
        <qbc-button>Save epic</qbc-button>
      </qbc-action-group>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '`align="between"` separates a destructive action from the confirm action.',
      },
    },
  },
};
