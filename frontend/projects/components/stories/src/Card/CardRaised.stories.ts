import type { StoryObj } from '@storybook/angular';

import type { CardComponent } from '@qbc/components';

export const Raised: StoryObj<CardComponent> = {
  render: () => ({
    template: `
      <div style="max-width: 360px">
        <qbc-card raised interactive>
          <h3 style="margin: 0 0 6px">Initiative: Assistant onboarding</h3>
          <p style="margin: 0">3 epics, 18 stories in the backlog.</p>
        </qbc-card>
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: '`raised` adds a shadow; `interactive` adds a hover state.' } },
  },
};
