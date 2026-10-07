import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  ButtonComponent,
  PageComponent,
  PageHeaderComponent,
  SectionLabelComponent,
} from '@qbc/components';

import descriptionMd from './PageDescription.md';
import bestPracticesMd from './PageBestPractices.md';

export { Default } from './PageDefault.stories';
export { WithSections } from './PageWithSections.stories';

export default {
  title: 'Components/Page',
  component: PageComponent,
  decorators: [
    moduleMetadata({
      imports: [PageComponent, PageHeaderComponent, SectionLabelComponent, ButtonComponent],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<PageComponent>;
