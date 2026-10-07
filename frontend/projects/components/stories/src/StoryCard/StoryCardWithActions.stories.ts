import type { StoryObj } from '@storybook/angular';

import type { StoryCardComponent } from '@qbc/components';

export const WithActions: StoryObj<StoryCardComponent> = {
  render: () => ({
    template: `
      <div style="max-width: 320px">
        <qbc-story-card
          storyKey="QBC-149"
          title="Assistant availability calendar"
          context="Epic: Assistants · Initiative: Team capacity"
          [points]="3"
          owner="Amara Okafor"
        >
          <qbc-button actions variant="quiet" size="xs">Open</qbc-button>
        </qbc-story-card>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Content with the `actions` attribute is placed at the end of the footer.',
      },
    },
  },
};
