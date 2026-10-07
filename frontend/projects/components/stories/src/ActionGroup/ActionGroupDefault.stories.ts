import type { StoryObj } from '@storybook/angular';

import type { ActionGroupComponent } from '@qbc/components';

export const Default: StoryObj<ActionGroupComponent> = {
  args: {
    align: 'end',
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-action-group [align]="align">
        <qbc-button variant="secondary">Cancel</qbc-button>
        <qbc-button>Start sprint</qbc-button>
      </qbc-action-group>
    `,
  }),
};
