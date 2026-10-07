import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { BoardColumnComponent, StoryCardComponent } from '@qbc/components';

import descriptionMd from './BoardColumnDescription.md';
import bestPracticesMd from './BoardColumnBestPractices.md';

export { Default } from './BoardColumnDefault.stories';
export { Empty } from './BoardColumnEmpty.stories';

export default {
  title: 'Components/BoardColumn',
  component: BoardColumnComponent,
  decorators: [moduleMetadata({ imports: [BoardColumnComponent, StoryCardComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<BoardColumnComponent>;
