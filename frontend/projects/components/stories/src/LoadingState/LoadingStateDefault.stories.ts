import type { StoryObj } from '@storybook/angular';

import type { LoadingStateComponent } from '@qbc/components';

export const Default: StoryObj<LoadingStateComponent> = {
  args: {},
  render: (args) => ({
    props: args,
    template: `<qbc-loading-state>Loading the sprint board…</qbc-loading-state>`,
  }),
};
