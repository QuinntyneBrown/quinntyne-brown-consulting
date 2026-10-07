import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { FormErrorComponent, FormGridComponent, TextInputComponent } from '@qbc/components';

import descriptionMd from './FormErrorDescription.md';
import bestPracticesMd from './FormErrorBestPractices.md';

export { Default } from './FormErrorDefault.stories';
export { AboveForm } from './FormErrorAboveForm.stories';

export default {
  title: 'Components/FormError',
  component: FormErrorComponent,
  decorators: [
    moduleMetadata({ imports: [FormErrorComponent, FormGridComponent, TextInputComponent] }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<FormErrorComponent>;
