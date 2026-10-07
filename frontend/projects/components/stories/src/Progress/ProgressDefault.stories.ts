import type { StoryObj } from '@storybook/angular';

import type { ProgressComponent } from '@qbc/components';

export const Default: StoryObj<ProgressComponent> = {
  args: {
    value: 65,
    label: 'Sprint 14 progress',
    mini: false,
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 420px">
        <qbc-progress [value]="value" [label]="label" [mini]="mini" />
      </div>
    `,
  }),
};
