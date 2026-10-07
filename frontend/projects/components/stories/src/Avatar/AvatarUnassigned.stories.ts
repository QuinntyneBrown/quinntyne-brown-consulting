import type { StoryObj } from '@storybook/angular';

import type { AvatarComponent } from '@qbc/components';

export const Unassigned: StoryObj<AvatarComponent> = {
  render: () => ({
    template: `<qbc-avatar />`,
  }),
  parameters: {
    docs: {
      description: { story: 'A blank `name` renders `—` and is labelled "Unassigned".' },
    },
  },
};
