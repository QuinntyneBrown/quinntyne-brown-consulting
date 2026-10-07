import type { StoryObj } from '@storybook/angular';

import type { BoardColumnComponent } from '@qbc/components';

export const Default: StoryObj<BoardColumnComponent> = {
  args: {
    label: 'In progress',
    count: 2,
    empty: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 320px">
        <qbc-board-column [label]="label" [count]="count" [empty]="empty">
          <qbc-story-card
            storyKey="QBC-142"
            title="Schedule assistant availability"
            context="Assistant onboarding"
            [points]="5"
            owner="Quinntyne Brown"
          />
          <qbc-story-card
            storyKey="QBC-157"
            title="Import backlog from CSV"
            context="Backlog tools"
            [points]="3"
            owner="Amara Okafor"
          />
        </qbc-board-column>
      </div>
    `,
  }),
};
