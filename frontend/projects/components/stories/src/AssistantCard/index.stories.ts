import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AssistantCardComponent, ButtonComponent } from '@qbc/components';

import descriptionMd from './AssistantCardDescription.md';
import bestPracticesMd from './AssistantCardBestPractices.md';

export { Default } from './AssistantCardDefault.stories';
export { WithActions } from './AssistantCardWithActions.stories';
export { Unavailable } from './AssistantCardUnavailable.stories';

export default {
  title: 'Components/AssistantCard',
  component: AssistantCardComponent,
  decorators: [moduleMetadata({ imports: [AssistantCardComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<AssistantCardComponent>;
