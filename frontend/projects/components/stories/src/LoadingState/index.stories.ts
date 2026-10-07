import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { LoadingStateComponent, PageComponent } from '@qbc/components';

import descriptionMd from './LoadingStateDescription.md';
import bestPracticesMd from './LoadingStateBestPractices.md';

export { Default } from './LoadingStateDefault.stories';
export { InPanel } from './LoadingStateInPanel.stories';

export default {
  title: 'Components/LoadingState',
  component: LoadingStateComponent,
  decorators: [moduleMetadata({ imports: [LoadingStateComponent, PageComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<LoadingStateComponent>;
