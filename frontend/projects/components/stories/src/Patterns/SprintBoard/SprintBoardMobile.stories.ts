import type { StoryObj } from '@storybook/angular';

import { boardColumns, shell } from '../shared/workboard';
import { boardPage, boardStyles } from './board';

export const Mobile: StoryObj = {
  render: () => ({
    props: { navOpen: false, columns: boardColumns },
    styles: boardStyles,
    template: shell(boardPage, { route: 'Board' }),
  }),
  globals: { viewport: { value: 'mobile' } },
  parameters: {
    docs: {
      description: {
        story:
          'On a phone the columns stack in workflow order. Drag and drop is impractical here, so the ← / → buttons on each card are the primary way to move work.',
      },
    },
  },
};
