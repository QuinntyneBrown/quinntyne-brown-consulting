import type { StoryObj } from '@storybook/angular';

import type { EmptyStateComponent } from '@qbc/components';

export const Default: StoryObj<EmptyStateComponent> = {
  args: {
    title: 'No initiatives yet',
    description: 'Create an outcome to start organizing delivery work.',
    icon: 'empty',
    bare: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-empty-state [title]="title" [description]="description" [icon]="icon" [bare]="bare">
        <qbc-button actions>New initiative</qbc-button>
      </qbc-empty-state>
    `,
  }),
};
