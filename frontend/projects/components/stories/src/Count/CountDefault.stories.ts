import type { StoryObj } from '@storybook/angular';

import type { CountComponent } from '@qbc/components';

export const Default: StoryObj<CountComponent> = {
  args: {
    value: 12,
  },
  render: (args) => ({
    props: args,
    template: `<qbc-count [value]="value" />`,
  }),
};
