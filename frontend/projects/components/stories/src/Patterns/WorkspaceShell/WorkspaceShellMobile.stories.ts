import type { StoryObj } from '@storybook/angular';

import { shell } from '../shared/workboard';

const page = `
  <qbc-page content>
    <qbc-page-header
      title="Backlog"
      description="Shape ideas into ready work, then place them into a two-week sprint."
    />
    <qbc-empty-state
      title="No matching stories"
      description="Try another filter or create a new story."
      ><qbc-button actions>New story</qbc-button></qbc-empty-state
    >
  </qbc-page>
`;

export const Mobile: StoryObj = {
  render: () => ({
    props: { navOpen: false },
    template: shell(page, { route: 'Backlog' }),
  }),
  globals: { viewport: { value: 'mobile' } },
  parameters: {
    docs: {
      description: {
        story:
          'Below 900px the sidebar leaves the screen, the gutter drops to 18px and the top bar shows a menu button instead of the breadcrumb. Press it to open the drawer.',
      },
    },
  },
};

export const MobileDrawerOpen: StoryObj = {
  name: 'Mobile drawer open',
  render: () => ({
    props: { navOpen: true },
    template: shell(page, { route: 'Backlog' }),
  }),
  globals: { viewport: { value: 'mobile' } },
  parameters: {
    docs: {
      description: {
        story:
          '`[open]` slides the sidebar over the page with `--qbc-shadow-overlay`; the menu button reports `aria-expanded="true"`. Choosing a destination closes it.',
      },
    },
  },
};
