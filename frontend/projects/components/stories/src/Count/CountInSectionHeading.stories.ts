import type { StoryObj } from '@storybook/angular';

import type { CountComponent } from '@qbc/components';

export const InSectionHeading: StoryObj<CountComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; align-items: center; padding: 12px; background: var(--qbc-soft); border-radius: 12px; width: 260px">
        <strong style="flex: 1">In progress</strong>
        <qbc-count [value]="4" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Beside a board column or backlog section heading, on a soft surface.',
      },
    },
  },
};
