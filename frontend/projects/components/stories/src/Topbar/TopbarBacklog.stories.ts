import type { StoryObj } from '@storybook/angular';

import type { TopbarComponent } from '@qbc/components';

export const Backlog: StoryObj<TopbarComponent> = {
  render: () => ({
    template: `
      <qbc-topbar breadcrumb="Workspace / Backlog">
        <qbc-button variant="secondary" size="sm">Import CSV</qbc-button>
        <qbc-button size="sm">New story</qbc-button>
      </qbc-topbar>
    `,
  }),
  parameters: {
    docs: {
      description: { story: "The default slot holds the page's global actions, aligned right." },
    },
  },
};
