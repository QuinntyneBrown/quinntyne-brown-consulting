import type { StoryObj } from '@storybook/angular';

import type { SelectComponent } from '@qbc/components';

export const Default: StoryObj<SelectComponent> = {
  args: {
    label: 'Story points',
    value: '5',
    hint: 'Estimate relative effort on the Fibonacci scale.',
    required: false,
    disabled: false,
    size: 'md',
    options: [
      { value: null, label: 'Not estimated' },
      { value: '1', label: '1 point' },
      { value: '2', label: '2 points' },
      { value: '3', label: '3 points' },
      { value: '5', label: '5 points' },
      { value: '8', label: '8 points' },
      { value: '13', label: '13 points' },
    ],
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 360px">
        <qbc-select
          [label]="label"
          [value]="value"
          [hint]="hint"
          [required]="required"
          [disabled]="disabled"
          [size]="size"
          [options]="options"
        />
      </div>
    `,
  }),
};
