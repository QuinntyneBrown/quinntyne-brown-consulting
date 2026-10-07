import type { StoryObj } from '@storybook/angular';

import type { IconComponent } from '@qbc/components';

export const Default: StoryObj<IconComponent> = {
  args: {
    name: 'board',
    size: 16,
    label: null,
  },
  render: (args) => ({
    props: args,
    template: `<qbc-icon [name]="name" [size]="size" [label]="label" />`,
  }),
};
