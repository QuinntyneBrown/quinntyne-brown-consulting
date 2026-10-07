import type { StoryObj } from '@storybook/angular';

import type { CheckboxComponent } from '@qbc/components';

export const Default: StoryObj<CheckboxComponent> = {
  args: {
    label: 'Include completed stories',
    value: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<qbc-checkbox [label]="label" [value]="value" [disabled]="disabled" />`,
  }),
};
