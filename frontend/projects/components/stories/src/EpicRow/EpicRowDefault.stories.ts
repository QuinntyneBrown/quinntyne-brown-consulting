import type { StoryObj } from '@storybook/angular';

import type { EpicRowComponent } from '@qbc/components';

export const Default: StoryObj<EpicRowComponent> = {
  args: {
    title: 'Sprint insights',
    summary: 'Velocity, burndown and exportable client reports.',
    storyCount: 8,
    progress: 62,
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-epic-row [title]="title" [summary]="summary" [storyCount]="storyCount" [progress]="progress">
        <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
        <qbc-button actions variant="secondary" size="sm">Add story</qbc-button>
      </qbc-epic-row>
    `,
  }),
};
