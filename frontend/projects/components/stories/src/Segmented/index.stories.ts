import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { SegmentedComponent } from '@qbc/components';

import descriptionMd from './SegmentedDescription.md';
import bestPracticesMd from './SegmentedBestPractices.md';

export { Default } from './SegmentedDefault.stories';
export { Interactive } from './SegmentedInteractive.stories';
export { WithTitles } from './SegmentedWithTitles.stories';

export default {
  title: 'Components/Segmented',
  component: SegmentedComponent,
  decorators: [moduleMetadata({ imports: [SegmentedComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<SegmentedComponent>;
