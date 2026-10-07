import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent, SprintRowComponent } from '@qbc/components';

import descriptionMd from './SprintRowDescription.md';
import bestPracticesMd from './SprintRowBestPractices.md';

export { Default } from './SprintRowDefault.stories';
export { Statuses } from './SprintRowStatuses.stories';
export { WithActions } from './SprintRowWithActions.stories';

export default {
  title: 'Components/SprintRow',
  component: SprintRowComponent,
  decorators: [moduleMetadata({ imports: [SprintRowComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<SprintRowComponent>;
