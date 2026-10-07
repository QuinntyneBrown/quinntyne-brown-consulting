import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { BrandComponent } from '@qbc/components';

import descriptionMd from './BrandDescription.md';
import bestPracticesMd from './BrandBestPractices.md';

export { Default } from './BrandDefault.stories';
export { CustomTagline } from './BrandCustomTagline.stories';

export default {
  title: 'Components/Brand',
  component: BrandComponent,
  decorators: [moduleMetadata({ imports: [BrandComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<BrandComponent>;
