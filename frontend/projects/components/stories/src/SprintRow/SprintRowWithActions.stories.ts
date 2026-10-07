import type { StoryObj } from '@storybook/angular';

import type { SprintRowComponent } from '@qbc/components';

export const WithActions: StoryObj<SprintRowComponent> = {
  render: () => ({
    template: `
      <qbc-sprint-row
        name="Sprint 15"
        status="planned"
        goal="Epic roll-up reporting"
        meta="Oct 13 – Oct 24 · 8 stories · 21 points"
      >
        <qbc-button actions variant="secondary" size="sm">Edit</qbc-button>
        <qbc-button actions size="sm">Start sprint</qbc-button>
      </qbc-sprint-row>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Content with the `actions` attribute sits on the right of the row and wraps below it on narrow screens.',
      },
    },
  },
};
