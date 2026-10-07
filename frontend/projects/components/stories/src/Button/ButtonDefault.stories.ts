import type { StoryObj } from '@storybook/angular';

import type { ButtonComponent } from '@qbc/components';

export const Default: StoryObj<ButtonComponent> = {
  args: {
    variant: 'primary',
    size: 'md',
    type: 'button',
    full: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-button [variant]="variant" [size]="size" [type]="type" [full]="full" [disabled]="disabled">
        Start sprint
      </qbc-button>
    `,
  }),
};
