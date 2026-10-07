import type { StoryObj } from '@storybook/angular';

import type { PasscodeInputComponent } from '@qbc/components';

export const SixDigits: StoryObj<PasscodeInputComponent> = {
  render: () => ({
    template: `<qbc-passcode-input label="Verification code" [length]="6" />`,
  }),
  parameters: {
    docs: {
      description: { story: '`length` sets the number of boxes and the input `maxlength`.' },
    },
  },
};
