import type { StoryObj } from '@storybook/angular';

import type { TextInputComponent } from '@qbc/components';

export const Default: StoryObj<TextInputComponent> = {
  args: {
    label: 'Story title',
    placeholder: 'e.g. Import backlog stories from CSV',
    hint: 'Describe the outcome, not the task.',
    type: 'text',
    size: 'md',
    required: false,
    readonly: false,
    disabled: false,
    labelHidden: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-text-input
        [label]="label"
        [placeholder]="placeholder"
        [hint]="hint"
        [type]="type"
        [size]="size"
        [required]="required"
        [readonly]="readonly"
        [disabled]="disabled"
        [labelHidden]="labelHidden"
      />
    `,
  }),
};
