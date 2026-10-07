import type { StoryObj } from '@storybook/angular';

import type { NavItemComponent } from '@qbc/components';

export const Default: StoryObj<NavItemComponent> = {
  args: {
    icon: 'backlog',
    label: 'Backlog',
    href: '/backlog',
  },
  render: (args) => ({
    props: args,
    template: `
      <nav aria-label="Workboard" style="max-width: 240px">
        <qbc-nav-item [icon]="icon" [label]="label" [href]="href" />
      </nav>
    `,
  }),
};
