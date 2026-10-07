import type { StoryObj } from '@storybook/angular';

import type { AssignmentLinkComponent } from '@qbc/components';

export const List: StoryObj<AssignmentLinkComponent> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 8px; max-width: 360px">
        <qbc-assignment-link storyKey="QBC-142" label="Schedule assistant availability" />
        <qbc-assignment-link storyKey="QBC-157" label="Import backlog from CSV" />
        <qbc-assignment-link storyKey="QBC-163" label="Sprint burndown chart" />
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: "Stacked as the list of an assistant's current stories." } },
  },
};
