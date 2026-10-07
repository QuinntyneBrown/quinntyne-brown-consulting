import type { StoryObj } from '@storybook/angular';

import type { BackLinkComponent } from '@qbc/components';

export const Default: StoryObj<BackLinkComponent> = {
  args: {
    href: '/backlog',
    label: 'Backlog',
  },
  render: (args) => ({
    props: args,
    template: `<qbc-back-link [href]="href" [label]="label" />`,
  }),
};
