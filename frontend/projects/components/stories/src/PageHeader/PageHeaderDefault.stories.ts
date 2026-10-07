import type { StoryObj } from '@storybook/angular';

import type { PageHeaderComponent } from '@qbc/components';

export const Default: StoryObj<PageHeaderComponent> = {
  args: {
    title: 'Backlog',
    description: 'Every story not yet planned into a sprint, ordered by priority.',
  },
  render: (args) => ({
    props: args,
    template: `<qbc-page-header [title]="title" [description]="description" />`,
  }),
};
