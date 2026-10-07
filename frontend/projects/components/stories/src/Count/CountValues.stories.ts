import type { StoryObj } from '@storybook/angular';

import type { CountComponent } from '@qbc/components';

export const Values: StoryObj<CountComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <qbc-count [value]="0" />
        <qbc-count [value]="7" />
        <qbc-count [value]="128" />
        <qbc-count value="99+" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Numbers or pre-formatted strings; the pill widens to fit.',
      },
    },
  },
};
