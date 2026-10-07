import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { CountComponent } from '@qbc/components';

import descriptionMd from './CountDescription.md';
import bestPracticesMd from './CountBestPractices.md';

export { Default } from './CountDefault.stories';
export { Values } from './CountValues.stories';
export { InSectionHeading } from './CountInSectionHeading.stories';

export default {
  title: 'Components/Count',
  component: CountComponent,
  decorators: [moduleMetadata({ imports: [CountComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<CountComponent>;
