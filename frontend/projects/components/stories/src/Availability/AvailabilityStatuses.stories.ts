import type { StoryObj } from '@storybook/angular';

import type { AvailabilityComponent } from '@qbc/components';

export const Statuses: StoryObj<AvailabilityComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 20px; align-items: center">
        <qbc-availability status="available" />
        <qbc-availability status="limited" />
        <qbc-availability status="unavailable" />
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: 'All three statuses side by side.' } },
  },
};
