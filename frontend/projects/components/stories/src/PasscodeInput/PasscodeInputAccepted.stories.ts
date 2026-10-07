import { FormControl } from '@angular/forms';
import type { StoryObj } from '@storybook/angular';

import type { PasscodeInputComponent } from '@qbc/components';

export const Accepted: StoryObj<PasscodeInputComponent> = {
  render: () => ({
    props: { passcode: new FormControl('1407') },
    template: `<qbc-passcode-input label="Workboard passcode" accepted [formControl]="passcode" />`,
  }),
  parameters: {
    docs: {
      description: {
        story: '`accepted` tints the filled boxes with the accent while the board opens.',
      },
    },
  },
};
