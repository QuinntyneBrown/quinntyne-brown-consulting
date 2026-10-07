import type { StoryObj } from '@storybook/angular';

import type { InitiativeCardComponent } from '@qbc/components';

export const WithActions: StoryObj<InitiativeCardComponent> = {
  render: () => ({
    template: `
      <qbc-initiative-card
        title="Sprint reporting"
        description="Give stakeholders a weekly view of sprint progress and velocity."
        summary="2 epics · 9 stories · 26 story points"
      >
        <qbc-button actions variant="secondary" size="sm">Edit</qbc-button>
        <qbc-button actions size="sm">Add epic</qbc-button>
        <p>No epics have been planned yet.</p>
      </qbc-initiative-card>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Elements with the `actions` attribute project into the header, to the right of the title.',
      },
    },
  },
};
