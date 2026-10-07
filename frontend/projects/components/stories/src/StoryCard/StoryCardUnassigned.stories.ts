import type { StoryObj } from '@storybook/angular';

import type { StoryCardComponent } from '@qbc/components';

export const Unassigned: StoryObj<StoryCardComponent> = {
  render: () => ({
    template: `
      <div style="max-width: 320px">
        <qbc-story-card
          storyKey="QBC-157"
          title="Forecast sprint capacity from story points"
          context="Epic: Forecasting"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'With no `owner` the byline reads "Unassigned", and a `null` `points` shows the unestimated state.',
      },
    },
  },
};
