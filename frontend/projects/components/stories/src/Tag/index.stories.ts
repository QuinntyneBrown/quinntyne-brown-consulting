import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TagComponent } from '@qbc/components';

import descriptionMd from './TagDescription.md';
import bestPracticesMd from './TagBestPractices.md';

export { Default } from './TagDefault.stories';
export { TagList } from './TagTagList.stories';

export default {
  title: 'Components/Tag',
  component: TagComponent,
  decorators: [moduleMetadata({ imports: [TagComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TagComponent>;
