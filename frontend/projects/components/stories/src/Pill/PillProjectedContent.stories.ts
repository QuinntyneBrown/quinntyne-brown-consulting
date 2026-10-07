import type { StoryObj } from '@storybook/angular';

import type { PillComponent } from '@qbc/components';

export const ProjectedContent: StoryObj<PillComponent> = {
  render: () => ({
    template: `<qbc-pill tone="planned">Sprint 15</qbc-pill>`,
  }),
  parameters: {
    docs: {
      description: { story: 'Without a `label`, the pill renders its projected content.' },
    },
  },
};
