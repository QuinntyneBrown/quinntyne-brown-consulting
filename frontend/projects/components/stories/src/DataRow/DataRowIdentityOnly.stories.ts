import type { StoryObj } from '@storybook/angular';

import type { DataRowComponent } from '@qbc/components';

export const IdentityOnly: StoryObj<DataRowComponent> = {
  render: () => ({
    template: `<qbc-data-row storyKey="QBC-170" title="Draft retro notes template" />`,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Every slot is optional; empty columns keep the grid aligned with other rows.',
      },
    },
  },
};
