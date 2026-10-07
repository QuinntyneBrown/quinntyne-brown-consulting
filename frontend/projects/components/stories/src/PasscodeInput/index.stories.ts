import { ReactiveFormsModule } from '@angular/forms';
import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { PasscodeInputComponent } from '@qbc/components';

import descriptionMd from './PasscodeInputDescription.md';
import bestPracticesMd from './PasscodeInputBestPractices.md';

export { Default } from './PasscodeInputDefault.stories';
export { Invalid } from './PasscodeInputInvalid.stories';
export { Accepted } from './PasscodeInputAccepted.stories';
export { Disabled } from './PasscodeInputDisabled.stories';
export { SixDigits } from './PasscodeInputSixDigits.stories';

export default {
  title: 'Components/PasscodeInput',
  component: PasscodeInputComponent,
  decorators: [moduleMetadata({ imports: [PasscodeInputComponent, ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<PasscodeInputComponent>;
