import type { StoryObj } from '@storybook/angular';

import type { StoryCardComponent } from '@qbc/components';

export const Dragging: StoryObj<StoryCardComponent> = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 260px)); gap: 16px">
        <qbc-story-card
          storyKey="QBC-150"
          title="Archive completed sprints"
          context="Epic: Sprint history"
          [points]="2"
          owner="Quinntyne Brown"
          draggableCard
        />
        <qbc-story-card
          storyKey="QBC-151"
          title="Move stories between board columns"
          context="Epic: Board"
          [points]="8"
          owner="Amara Okafor"
          draggableCard
          dragging
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`draggableCard` sets `draggable` and a grab cursor; `dragging` fades the card while it is being moved.',
      },
    },
  },
};
