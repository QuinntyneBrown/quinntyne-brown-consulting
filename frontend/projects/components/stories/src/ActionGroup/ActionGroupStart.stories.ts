import type { StoryObj } from '@storybook/angular';

import type { ActionGroupComponent } from '@qbc/components';

export const Start: StoryObj<ActionGroupComponent> = {
  render: () => ({
    template: `
      <qbc-action-group align="start">
        <qbc-button>Save story</qbc-button>
        <qbc-button variant="quiet">Discard changes</qbc-button>
      </qbc-action-group>
    `,
  }),
  parameters: {
    docs: {
      description: { story: '`align="start"` keeps actions flush with the content above them.' },
    },
  },
};
