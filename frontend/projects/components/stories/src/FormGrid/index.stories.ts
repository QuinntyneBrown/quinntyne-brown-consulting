import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  FieldComponent,
  FormGridComponent,
  SelectComponent,
  TextInputComponent,
  TextareaComponent,
} from '@qbc/components';

import descriptionMd from './FormGridDescription.md';
import bestPracticesMd from './FormGridBestPractices.md';

export { Default } from './FormGridDefault.stories';
export { FullWidthFields } from './FormGridFullWidthFields.stories';
export { WithFields } from './FormGridWithFields.stories';

export default {
  title: 'Components/FormGrid',
  component: FormGridComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormGridComponent,
        TextInputComponent,
        TextareaComponent,
        SelectComponent,
        FieldComponent,
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
} as Meta<FormGridComponent>;
