import type { StoryObj } from '@storybook/angular';

import type { TextareaComponent } from '@qbc/components';

export const Default: StoryObj<TextareaComponent> = {
  args: {
    label: 'Acceptance criteria',
    placeholder: 'Given… when… then…',
    hint: 'One criterion per line.',
    required: false,
    readonly: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-textarea
        [label]="label"
        [placeholder]="placeholder"
        [hint]="hint"
        [required]="required"
        [readonly]="readonly"
        [disabled]="disabled"
      />
    `,
  }),
};
