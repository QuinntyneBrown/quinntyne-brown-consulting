import type { StoryObj } from '@storybook/angular';

import type { IconComponent } from '@qbc/components';

export const Labelled: StoryObj<IconComponent> = {
  render: () => ({
    template: `
      <p style="display: flex; gap: 6px; align-items: center; margin: 0">
        <qbc-icon name="alert" label="Blocked" />
        QBC-151 is waiting on client sign-off.
      </p>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'With `label` the glyph is announced as an image; without it, it is hidden from assistive technology.',
      },
    },
  },
};
