import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AssignmentLinkComponent } from '@qbc/components';

import descriptionMd from './AssignmentLinkDescription.md';
import bestPracticesMd from './AssignmentLinkBestPractices.md';

export { Default } from './AssignmentLinkDefault.stories';
export { List } from './AssignmentLinkList.stories';

export default {
  title: 'Components/AssignmentLink',
  component: AssignmentLinkComponent,
  decorators: [moduleMetadata({ imports: [AssignmentLinkComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<AssignmentLinkComponent>;
