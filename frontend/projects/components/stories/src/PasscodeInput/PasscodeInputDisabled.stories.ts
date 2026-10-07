import { FormControl } from '@angular/forms';
import type { StoryObj } from '@storybook/angular';

import type { PasscodeInputComponent } from '@qbc/components';

export const Disabled: StoryObj<PasscodeInputComponent> = {
  render: () => ({
    props: { passcode: new FormControl({ value: '', disabled: true }) },
    template: `<qbc-passcode-input label="Workboard passcode" [formControl]="passcode" />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Disable it with the `disabled` input or by disabling the bound form control, e.g. while a passcode is being checked.',
      },
    },
  },
};
