import type { StoryObj } from '@storybook/angular';

import type { EmptyStateComponent } from '@qbc/components';

export const CustomIcon: StoryObj<EmptyStateComponent> = {
  render: () => ({
    template: `
      <qbc-empty-state
        icon="assistants"
        title="No assistants on the team"
        description="Add an assistant so stories can be assigned and estimated."
      >
        <qbc-button actions>Add assistant</qbc-button>
        <qbc-button actions variant="secondary">Import from CSV</qbc-button>
      </qbc-empty-state>
    `,
  }),
  parameters: {
    docs: {
      description: { story: 'Any `IconName` can replace the default `empty` glyph.' },
    },
  },
};
