import type { StoryObj } from '@storybook/angular';

import type { ProgressComponent } from '@qbc/components';

export const Mini: StoryObj<ProgressComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <span>Checkout redesign</span>
        <qbc-progress [value]="40" [mini]="true" label="Checkout redesign epic progress" />
        <small>8 of 20 points</small>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: { story: '`mini` is a fixed 110px track for inline use on epic rows.' },
    },
  },
};
