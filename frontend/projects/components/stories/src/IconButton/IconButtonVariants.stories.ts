import type { StoryObj } from '@storybook/angular';

import type { IconButtonComponent } from '@qbc/components';

export const Variants: StoryObj<IconButtonComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <qbc-icon-button icon="more" label="Story actions" />
        <qbc-icon-button icon="close" label="Close panel" variant="bare" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '`default` is bordered; `bare` drops the border for dialog and panel headers.',
      },
    },
  },
};
