import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent, EmptyStateComponent } from '@qbc/components';

import descriptionMd from './EmptyStateDescription.md';
import bestPracticesMd from './EmptyStateBestPractices.md';

export { Default } from './EmptyStateDefault.stories';
export { Bare } from './EmptyStateBare.stories';
export { CustomIcon } from './EmptyStateCustomIcon.stories';
export { Subtitle } from './EmptyStateSubtitle.stories';

export default {
  title: 'Components/EmptyState',
  component: EmptyStateComponent,
  decorators: [moduleMetadata({ imports: [EmptyStateComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<EmptyStateComponent>;
