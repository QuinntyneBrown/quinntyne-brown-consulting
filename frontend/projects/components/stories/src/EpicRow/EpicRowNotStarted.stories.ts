import type { StoryObj } from '@storybook/angular';

import type { EpicRowComponent } from '@qbc/components';

export const NotStarted: StoryObj<EpicRowComponent> = {
  render: () => ({
    template: `
      <qbc-epic-row title="Client portal" summary="A read-only view of the sprint for clients." [storyCount]="1" [progress]="0">
        <qbc-button actions variant="secondary" size="sm">Add story</qbc-button>
      </qbc-epic-row>
    `,
  }),
  parameters: {
    docs: {
      description: { story: 'A single story pluralizes to "1 story"; progress starts at 0%.' },
    },
  },
};
