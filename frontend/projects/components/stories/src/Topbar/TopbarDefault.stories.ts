import type { StoryObj } from '@storybook/angular';

import type { TopbarComponent } from '@qbc/components';

export const Default: StoryObj<TopbarComponent> = {
  args: {
    breadcrumb: 'Workspace / Board',
    navOpen: false,
    menuLabel: 'Open navigation',
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-topbar [breadcrumb]="breadcrumb" [navOpen]="navOpen" [menuLabel]="menuLabel">
        <qbc-button size="sm">New story</qbc-button>
      </qbc-topbar>
    `,
  }),
};
