import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { BackLinkComponent } from '@qbc/components';

import descriptionMd from './BackLinkDescription.md';
import bestPracticesMd from './BackLinkBestPractices.md';

export { Default } from './BackLinkDefault.stories';
export { DefaultLabel } from './BackLinkDefaultLabel.stories';

export default {
  title: 'Components/BackLink',
  component: BackLinkComponent,
  decorators: [moduleMetadata({ imports: [BackLinkComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<BackLinkComponent>;
