import type { StoryObj } from '@storybook/angular';

import type { StoryCardComponent } from '@qbc/components';

export const Default: StoryObj<StoryCardComponent> = {
  args: {
    storyKey: 'QBC-142',
    title: 'Import backlog stories from CSV',
    context: 'Epic: Backlog import · Initiative: Faster planning',
    points: 5,
    owner: 'Quinntyne Brown',
    draggableCard: false,
    dragging: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 320px">
        <qbc-story-card
          [storyKey]="storyKey"
          [title]="title"
          [context]="context"
          [points]="points"
          [owner]="owner"
          [draggableCard]="draggableCard"
          [dragging]="dragging"
        />
      </div>
    `,
  }),
};
