import type { StoryObj } from '@storybook/angular';

import type { PointsComponent } from '@qbc/components';

export const Default: StoryObj<PointsComponent> = {
  args: {
    value: 5,
  },
  render: (args) => ({
    props: args,
    template: `<qbc-points [value]="value" />`,
  }),
};
