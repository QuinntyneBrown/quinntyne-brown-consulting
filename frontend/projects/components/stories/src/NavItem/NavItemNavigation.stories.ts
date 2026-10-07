import type { StoryObj } from '@storybook/angular';

import type { NavItemComponent } from '@qbc/components';

export const Navigation: StoryObj<NavItemComponent> = {
  render: () => ({
    template: `
      <nav aria-label="Workboard" style="display: grid; gap: 4px; max-width: 240px">
        <qbc-nav-item icon="board" label="Sprint board" href="/board" />
        <qbc-nav-item icon="backlog" label="Backlog" href="/backlog" />
        <qbc-nav-item icon="initiatives" label="Initiatives" href="/initiatives" />
        <qbc-nav-item icon="assistants" label="Assistants" href="/assistants" />
      </nav>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The sidebar stacks one item per destination. The item whose `href` matches the current route gets the `active` style.',
      },
    },
  },
};
