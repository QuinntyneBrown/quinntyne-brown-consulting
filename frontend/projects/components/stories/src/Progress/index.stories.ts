import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ProgressComponent } from '@qbc/components';

import descriptionMd from './ProgressDescription.md';
import bestPracticesMd from './ProgressBestPractices.md';

export { Default } from './ProgressDefault.stories';
export { Mini } from './ProgressMini.stories';
export { Range } from './ProgressRange.stories';

export default {
  title: 'Components/Progress',
  component: ProgressComponent,
  decorators: [moduleMetadata({ imports: [ProgressComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<ProgressComponent>;
