import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  ButtonComponent,
  DialogComponent,
  FormErrorComponent,
  FormGridComponent,
  TextInputComponent,
  TextareaComponent,
} from '@qbc/components';

import descriptionMd from './DialogDescription.md';
import bestPracticesMd from './DialogBestPractices.md';

export { Default } from './DialogDefault.stories';
export { Small } from './DialogSmall.stories';
export { WithForm } from './DialogWithForm.stories';

export default {
  title: 'Components/Dialog',
  component: DialogComponent,
  decorators: [
    moduleMetadata({
      imports: [
        DialogComponent,
        ButtonComponent,
        FormGridComponent,
        TextInputComponent,
        TextareaComponent,
        FormErrorComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<DialogComponent>;
