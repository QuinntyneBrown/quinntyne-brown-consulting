import type { StoryObj } from '@storybook/angular';

import type { ButtonComponent } from '@qbc/components';

export const Variants: StoryObj<ButtonComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center">
        <qbc-button>Add story</qbc-button>
        <qbc-button variant="secondary">Edit sprint</qbc-button>
        <qbc-button variant="quiet">Cancel</qbc-button>
        <qbc-button variant="danger">Delete epic</qbc-button>
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: '`primary`, `secondary`, `quiet` and `danger`.' } },
  },
};
