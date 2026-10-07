import type { StoryObj } from '@storybook/angular';

import type { StatusPillComponent } from '@qbc/components';

export const ProjectedLabel: StoryObj<StatusPillComponent> = {
  render: () => ({
    template: `<qbc-status-pill tone="ready">Ready for review</qbc-status-pill>`,
  }),
  parameters: {
    docs: {
      description: { story: 'Without a `label`, the projected content becomes the pill text.' },
    },
  },
};
