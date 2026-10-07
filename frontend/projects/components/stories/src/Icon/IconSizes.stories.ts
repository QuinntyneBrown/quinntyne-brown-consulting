import type { StoryObj } from '@storybook/angular';

import type { IconComponent } from '@qbc/components';

export const Sizes: StoryObj<IconComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; align-items: center">
        <qbc-icon name="initiatives" [size]="12" />
        <qbc-icon name="initiatives" [size]="16" />
        <qbc-icon name="initiatives" [size]="20" />
        <qbc-icon name="initiatives" [size]="28" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`size` sets the glyph in px; the box is never narrower than 18px so rows stay aligned.',
      },
    },
  },
};
