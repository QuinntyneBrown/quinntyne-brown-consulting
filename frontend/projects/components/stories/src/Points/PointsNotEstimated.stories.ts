import type { StoryObj } from '@storybook/angular';

import type { PointsComponent } from '@qbc/components';

export const NotEstimated: StoryObj<PointsComponent> = {
  render: () => ({
    template: `<qbc-points />`,
  }),
  parameters: {
    docs: {
      description: { story: 'A null `value` renders `—` and is labelled "Not estimated".' },
    },
  },
};
