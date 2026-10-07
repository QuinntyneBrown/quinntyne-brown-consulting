import type { StoryObj } from '@storybook/angular';

import type { TagComponent } from '@qbc/components';

export const TagList: StoryObj<TagComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 6px">
        <qbc-tag>Frontend</qbc-tag>
        <qbc-tag>API</qbc-tag>
        <qbc-tag>Forecasting</qbc-tag>
        <qbc-tag>Sprint 14</qbc-tag>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Tags are inline, so a wrapping flex row lays out a set of labels on a story or initiative.',
      },
    },
  },
};
