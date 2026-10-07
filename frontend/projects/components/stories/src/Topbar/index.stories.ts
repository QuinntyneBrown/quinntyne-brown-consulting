import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent, TopbarComponent } from '@qbc/components';

import descriptionMd from './TopbarDescription.md';
import bestPracticesMd from './TopbarBestPractices.md';

export { Default } from './TopbarDefault.stories';
export { Backlog } from './TopbarBacklog.stories';
export { NavigationOpen } from './TopbarNavigationOpen.stories';

export default {
  title: 'Components/Topbar',
  component: TopbarComponent,
  decorators: [moduleMetadata({ imports: [TopbarComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TopbarComponent>;
