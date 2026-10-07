import type { StoryObj } from '@storybook/angular';

import { boardColumns, shell } from '../shared/workboard';
import { boardPage, boardStyles } from './board';

export const EmptyColumn: StoryObj = {
  name: 'Sprint just started',
  render: () => ({
    props: {
      navOpen: false,
      columns: boardColumns.map((column) => ({
        ...column,
        stories: column.first ? boardColumns.flatMap((c) => c.stories) : [],
      })),
    },
    styles: boardStyles,
    template: shell(boardPage, { route: 'Board' }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'Day one of a sprint: everything is in To do, and the empty In progress and Done columns show their placeholder through `empty`.',
      },
    },
  },
};
