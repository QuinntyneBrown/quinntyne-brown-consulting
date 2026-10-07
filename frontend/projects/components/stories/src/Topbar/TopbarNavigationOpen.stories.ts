import type { StoryObj } from '@storybook/angular';

import type { TopbarComponent } from '@qbc/components';

export const NavigationOpen: StoryObj<TopbarComponent> = {
  render: () => ({
    template: `
      <qbc-topbar breadcrumb="Workspace / Initiatives" [navOpen]="true" menuLabel="Close navigation" />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Below 900px the breadcrumb hides and a menu button appears; `navOpen` sets its `aria-expanded` and `menuLabel` its name. Switch to the Mobile viewport to see it.',
      },
    },
  },
};
