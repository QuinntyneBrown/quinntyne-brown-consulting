import type { StoryObj } from '@storybook/angular';

import type { PageHeaderComponent } from '@qbc/components';

export const WithActions: StoryObj<PageHeaderComponent> = {
  render: () => ({
    template: `
      <qbc-page-header
        title="Sprint 14"
        description="Oct 6 – Oct 17 · 34 of 52 story points complete."
      >
        <qbc-button actions variant="secondary">Edit sprint</qbc-button>
        <qbc-button actions>Add story</qbc-button>
      </qbc-page-header>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Elements with the `actions` attribute sit to the right of the title, and wrap below it on narrow screens.',
      },
    },
  },
};
