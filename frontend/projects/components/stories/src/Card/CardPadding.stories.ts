import type { StoryObj } from '@storybook/angular';

import type { CardComponent } from '@qbc/components';

export const Padding: StoryObj<CardComponent> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 12px; max-width: 360px">
        <qbc-card padding="none">padding="none"</qbc-card>
        <qbc-card padding="md">padding="md"</qbc-card>
        <qbc-card padding="lg">padding="lg"</qbc-card>
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: '`none`, `md` (default) and `lg`.' } },
  },
};
