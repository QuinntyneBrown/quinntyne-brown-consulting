import type { StoryObj } from '@storybook/angular';

import type { BoardColumnComponent } from '@qbc/components';

export const Empty: StoryObj<BoardColumnComponent> = {
  render: () => ({
    template: `
      <div style="max-width: 320px">
        <qbc-board-column label="Done" [count]="0" [empty]="true" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: { story: '`empty` shows a placeholder when no stories are in the column.' },
    },
  },
};
