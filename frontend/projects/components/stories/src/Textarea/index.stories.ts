import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule } from '@angular/forms';

import { TextareaComponent } from '@qbc/components';

import descriptionMd from './TextareaDescription.md';
import bestPracticesMd from './TextareaBestPractices.md';

export { Default } from './TextareaDefault.stories';
export { States } from './TextareaStates.stories';
export { ReactiveForm } from './TextareaReactiveForm.stories';

export default {
  title: 'Components/Textarea',
  component: TextareaComponent,
  decorators: [moduleMetadata({ imports: [TextareaComponent, ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TextareaComponent>;
