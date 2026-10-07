import type { StoryObj } from '@storybook/angular';

import type { ToastComponent } from '@qbc/components';

export const Stack: StoryObj<ToastComponent> = {
  render: () => ({
    template: `
      <div role="status" style="display: grid; gap: 8px">
        <qbc-toast>12 stories imported to the backlog.</qbc-toast>
        <qbc-toast>Assistant Amara Okafor added to the Faster planning initiative.</qbc-toast>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Several messages stacked in a live region, as the app's toast outlet does.",
      },
    },
  },
};
