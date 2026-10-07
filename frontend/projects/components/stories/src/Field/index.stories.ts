import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { FieldComponent } from '@qbc/components';

import descriptionMd from './FieldDescription.md';
import bestPracticesMd from './FieldBestPractices.md';

export { Default } from './FieldDefault.stories';
export { Required } from './FieldRequired.stories';
export { FullWidth } from './FieldFullWidth.stories';

export default {
  title: 'Components/Field',
  component: FieldComponent,
  decorators: [moduleMetadata({ imports: [FieldComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<FieldComponent>;
