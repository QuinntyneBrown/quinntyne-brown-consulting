import type { StoryObj } from '@storybook/angular';

import type { ToastComponent } from '@qbc/components';

export const Default: StoryObj<ToastComponent> = {
  args: {
    tone: 'default',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'error'] },
  },
  render: (args) => ({
    props: args,
    template: `<qbc-toast [tone]="tone">Story QBC-142 moved to In progress.</qbc-toast>`,
  }),
};
