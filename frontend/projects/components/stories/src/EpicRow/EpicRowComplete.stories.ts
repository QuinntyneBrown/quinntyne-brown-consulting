import type { StoryObj } from '@storybook/angular';

import type { EpicRowComponent } from '@qbc/components';

export const Complete: StoryObj<EpicRowComponent> = {
  render: () => ({
    template: `
      <qbc-epic-row title="Workboard MVP" summary="Board, backlog and sprint planning." [storyCount]="14" [progress]="100" />
    `,
  }),
  parameters: {
    docs: {
      description: { story: 'Every story done, with no actions projected.' },
    },
  },
};
