import type { StoryObj } from '@storybook/angular';

import type { AvatarComponent } from '@qbc/components';

export const Size: StoryObj<AvatarComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <qbc-avatar name="Quinntyne Brown" size="sm" />
        <qbc-avatar name="Quinntyne Brown" size="lg" />
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: '`sm` (default) on rows and cards, `lg` in the top bar.' } },
  },
};
