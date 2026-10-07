import type { StoryObj } from '@storybook/angular';

import type { LoadingStateComponent } from '@qbc/components';

export const InPanel: StoryObj<LoadingStateComponent> = {
  render: () => ({
    template: `
      <div style="border: 1px solid var(--qbc-line); border-radius: var(--qbc-r-xl)">
        <qbc-loading-state>Loading backlog stories…</qbc-loading-state>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Placed where the list will render, so the layout does not jump when data arrives.',
      },
    },
  },
};
