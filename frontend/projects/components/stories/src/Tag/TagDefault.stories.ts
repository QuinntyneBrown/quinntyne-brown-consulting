import type { StoryObj } from '@storybook/angular';

import type { TagComponent } from '@qbc/components';

export const Default: StoryObj<TagComponent> = {
  args: {},
  render: (args) => ({
    props: args,
    template: `<qbc-tag>Backlog import</qbc-tag>`,
  }),
};
