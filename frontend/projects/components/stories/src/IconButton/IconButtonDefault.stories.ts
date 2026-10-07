import type { StoryObj } from '@storybook/angular';

import type { IconButtonComponent } from '@qbc/components';

export const Default: StoryObj<IconButtonComponent> = {
  args: {
    icon: 'add',
    label: 'Add story',
    variant: 'default',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<qbc-icon-button [icon]="icon" [label]="label" [variant]="variant" [disabled]="disabled" />`,
  }),
};
