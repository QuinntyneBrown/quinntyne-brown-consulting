import { FormControl } from '@angular/forms';
import type { StoryObj } from '@storybook/angular';

import type { PasscodeInputComponent } from '@qbc/components';

export const Invalid: StoryObj<PasscodeInputComponent> = {
  render: () => ({
    props: { passcode: new FormControl('4821') },
    template: `
      <qbc-passcode-input
        label="Workboard passcode"
        invalid
        describedBy="passcode-error"
        [formControl]="passcode"
      />
      <p id="passcode-error" style="margin-top: 12px; color: var(--qbc-danger); text-align: center">
        That passcode didn’t match. Try again.
      </p>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`invalid` turns the boxes red, shakes them once and sets `aria-invalid`; point `describedBy` at the error text.',
      },
    },
  },
};
