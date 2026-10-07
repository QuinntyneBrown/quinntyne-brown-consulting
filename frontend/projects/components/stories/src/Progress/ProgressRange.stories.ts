import type { StoryObj } from '@storybook/angular';

import type { ProgressComponent } from '@qbc/components';

export const Range: StoryObj<ProgressComponent> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 14px; max-width: 420px">
        <qbc-progress [value]="0" label="Not started" />
        <qbc-progress [value]="50" label="Half complete" />
        <qbc-progress [value]="100" label="Complete" />
        <qbc-progress [value]="140" label="Over-delivered, clamped to 100" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Values are clamped to 0–100, and non-finite values render as 0.',
      },
    },
  },
};
