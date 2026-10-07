import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { TextInputComponent } from '@qbc/components';

import descriptionMd from './TextInputDescription.md';
import bestPracticesMd from './TextInputBestPractices.md';

export { Default } from './TextInputDefault.stories';
export { WithIcon } from './TextInputWithIcon.stories';
export { States } from './TextInputStates.stories';
export { ReactiveForm } from './TextInputReactiveForm.stories';

export default {
  title: 'Components/TextInput',
  component: TextInputComponent,
  decorators: [moduleMetadata({ imports: [TextInputComponent, ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TextInputComponent>;
