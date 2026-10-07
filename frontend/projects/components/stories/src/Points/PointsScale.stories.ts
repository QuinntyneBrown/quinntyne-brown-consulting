import type { StoryObj } from '@storybook/angular';

import type { PointsComponent } from '@qbc/components';

export const Scale: StoryObj<PointsComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <qbc-points [value]="1" />
        <qbc-points [value]="2" />
        <qbc-points [value]="3" />
        <qbc-points [value]="5" />
        <qbc-points [value]="8" />
        <qbc-points [value]="13" />
        <qbc-points [value]="21" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'The badge widens for two-digit estimates on the Fibonacci scale.',
      },
    },
  },
};
