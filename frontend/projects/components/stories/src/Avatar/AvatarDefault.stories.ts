import type { StoryObj } from '@storybook/angular';

import type { AvatarComponent } from '@qbc/components';

export const Default: StoryObj<AvatarComponent> = {
  args: {
    name: 'Quinntyne Brown',
    size: 'sm',
  },
  render: (args) => ({
    props: args,
    template: `<qbc-avatar [name]="name" [size]="size" />`,
  }),
};
