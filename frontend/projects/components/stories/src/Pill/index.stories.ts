import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { PillComponent } from '@qbc/components';

import descriptionMd from './PillDescription.md';
import bestPracticesMd from './PillBestPractices.md';

export { Default } from './PillDefault.stories';
export { Tones } from './PillTones.stories';
export { ProjectedContent } from './PillProjectedContent.stories';

export default {
  title: 'Components/Pill',
  component: PillComponent,
  decorators: [moduleMetadata({ imports: [PillComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<PillComponent>;
