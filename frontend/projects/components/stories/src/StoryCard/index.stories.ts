import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent, StoryCardComponent } from '@qbc/components';

import descriptionMd from './StoryCardDescription.md';
import bestPracticesMd from './StoryCardBestPractices.md';

export { Default } from './StoryCardDefault.stories';
export { Unassigned } from './StoryCardUnassigned.stories';
export { WithActions } from './StoryCardWithActions.stories';
export { Dragging } from './StoryCardDragging.stories';

export default {
  title: 'Components/StoryCard',
  component: StoryCardComponent,
  decorators: [moduleMetadata({ imports: [StoryCardComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<StoryCardComponent>;
