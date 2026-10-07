import type { StoryObj } from '@storybook/angular';

import type { PasscodeInputComponent } from '@qbc/components';

export const Default: StoryObj<PasscodeInputComponent> = {
  args: {
    label: 'Workboard passcode',
    length: 4,
    disabled: false,
    invalid: false,
    accepted: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-passcode-input
        [label]="label"
        [length]="length"
        [disabled]="disabled"
        [invalid]="invalid"
        [accepted]="accepted"
      />
    `,
  }),
};
