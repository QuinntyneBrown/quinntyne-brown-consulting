import type { StoryObj } from '@storybook/angular';

import { boardColumns, shell } from '../shared/workboard';
import { boardPage, boardStyles } from './board';

export const ActiveSprint: StoryObj = {
  name: 'Active sprint',
  render: () => ({
    props: { navOpen: false, columns: boardColumns },
    styles: boardStyles,
    template: shell(boardPage, { route: 'Board' }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'Two of five stories done. Cards in To do cannot move backward and cards in Done cannot move forward, so those buttons are disabled rather than hidden.',
      },
    },
  },
};
