import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { SkipLinkComponent } from '@qbc/components';

import descriptionMd from './SkipLinkDescription.md';
import bestPracticesMd from './SkipLinkBestPractices.md';

export { Default } from './SkipLinkDefault.stories';
export { CustomLabel } from './SkipLinkCustomLabel.stories';

export default {
  title: 'Components/SkipLink',
  component: SkipLinkComponent,
  decorators: [moduleMetadata({ imports: [SkipLinkComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<SkipLinkComponent>;
