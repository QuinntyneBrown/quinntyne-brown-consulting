import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { CheckboxComponent } from '@qbc/components';

import descriptionMd from './CheckboxDescription.md';
import bestPracticesMd from './CheckboxBestPractices.md';

export { Default } from './CheckboxDefault.stories';
export { Checked } from './CheckboxChecked.stories';
export { Disabled } from './CheckboxDisabled.stories';
export { WithFormControl } from './CheckboxWithFormControl.stories';

export default {
  title: 'Components/Checkbox',
  component: CheckboxComponent,
  decorators: [moduleMetadata({ imports: [CheckboxComponent, ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<CheckboxComponent>;
