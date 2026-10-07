import type { StoryObj } from '@storybook/angular';

import type { IconButtonComponent } from '@qbc/components';

export const Disabled: StoryObj<IconButtonComponent> = {
  render: () => ({
    template: `<qbc-icon-button icon="trash" label="Delete sprint" [disabled]="true" />`,
  }),
  parameters: {
    docs: {
      description: { story: 'Dimmed with a not-allowed cursor.' },
    },
  },
};
