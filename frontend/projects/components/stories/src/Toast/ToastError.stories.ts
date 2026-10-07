import type { StoryObj } from '@storybook/angular';

import type { ToastComponent } from '@qbc/components';

export const Error: StoryObj<ToastComponent> = {
  render: () => ({
    template: `<qbc-toast tone="error">Couldn't save Sprint 14. Check your connection and try again.</qbc-toast>`,
  }),
  parameters: {
    docs: {
      description: { story: '`tone="error"` switches to the danger background for failures.' },
    },
  },
};
