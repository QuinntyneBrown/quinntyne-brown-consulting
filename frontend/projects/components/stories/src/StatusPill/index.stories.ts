import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { StatusPillComponent } from '@qbc/components';

import descriptionMd from './StatusPillDescription.md';
import bestPracticesMd from './StatusPillBestPractices.md';

export { Default } from './StatusPillDefault.stories';
export { Tones } from './StatusPillTones.stories';
export { ProjectedLabel } from './StatusPillProjectedLabel.stories';

export default {
  title: 'Components/StatusPill',
  component: StatusPillComponent,
  decorators: [moduleMetadata({ imports: [StatusPillComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<StatusPillComponent>;
