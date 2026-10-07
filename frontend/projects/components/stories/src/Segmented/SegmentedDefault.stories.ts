import type { StoryObj } from '@storybook/angular';

import type { SegmentedComponent } from '@qbc/components';

export const Default: StoryObj<SegmentedComponent> = {
  args: {
    options: [
      { value: 'board', label: 'Board' },
      { value: 'list', label: 'List' },
    ],
    selected: 'board',
    ariaLabel: 'Sprint view',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: inline-block">
        <qbc-segmented [options]="options" [selected]="selected" [ariaLabel]="ariaLabel" />
      </div>
    `,
  }),
};
