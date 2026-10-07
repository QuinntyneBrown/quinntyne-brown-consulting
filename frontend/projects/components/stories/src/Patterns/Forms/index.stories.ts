import { ReactiveFormsModule } from '@angular/forms';
import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  ActionGroupComponent,
  ButtonComponent,
  CheckboxComponent,
  DialogComponent,
  FieldComponent,
  FormErrorComponent,
  FormGridComponent,
  SelectComponent,
  TextInputComponent,
  TextareaComponent,
} from '@qbc/components';

import descriptionMd from './FormsDescription.md';

export { StoryEditor } from './FormsStoryEditor.stories';
export { Validation } from './FormsValidation.stories';
export { SprintSettings } from './FormsSprintSettings.stories';
export { InDialog } from './FormsInDialog.stories';

export default {
  title: 'Patterns/Forms',
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        FormGridComponent,
        FieldComponent,
        TextInputComponent,
        TextareaComponent,
        SelectComponent,
        CheckboxComponent,
        FormErrorComponent,
        ActionGroupComponent,
        ButtonComponent,
        DialogComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: { component: descriptionMd },
    },
  },
} as Meta;
