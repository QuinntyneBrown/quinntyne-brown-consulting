import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent, PageHeaderComponent } from '@qbc/components';

import descriptionMd from './PageHeaderDescription.md';
import bestPracticesMd from './PageHeaderBestPractices.md';

export { Default } from './PageHeaderDefault.stories';
export { WithActions } from './PageHeaderWithActions.stories';

export default {
  title: 'Components/PageHeader',
  component: PageHeaderComponent,
  decorators: [moduleMetadata({ imports: [PageHeaderComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<PageHeaderComponent>;
