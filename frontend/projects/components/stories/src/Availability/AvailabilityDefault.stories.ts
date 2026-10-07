import type { StoryObj } from '@storybook/angular';

import type { AvailabilityComponent } from '@qbc/components';

export const Default: StoryObj<AvailabilityComponent> = {
  args: {
    status: 'available',
  },
  render: (args) => ({
    props: args,
    template: `<qbc-availability [status]="status" />`,
  }),
};
