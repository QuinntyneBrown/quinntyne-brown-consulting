import type { StoryObj } from '@storybook/angular';

import type { ButtonComponent } from '@qbc/components';

export const Sizes: StoryObj<ButtonComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <qbc-button size="md">Medium</qbc-button>
        <qbc-button size="sm">Small</qbc-button>
        <qbc-button size="xs">Extra small</qbc-button>
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: '`md` (default), `sm` and `xs`.' } },
  },
};
