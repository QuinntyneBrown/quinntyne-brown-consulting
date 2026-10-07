import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AvailabilityComponent } from '@qbc/components';

import descriptionMd from './AvailabilityDescription.md';
import bestPracticesMd from './AvailabilityBestPractices.md';

export { Default } from './AvailabilityDefault.stories';
export { Statuses } from './AvailabilityStatuses.stories';

export default {
  title: 'Components/Availability',
  component: AvailabilityComponent,
  decorators: [moduleMetadata({ imports: [AvailabilityComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<AvailabilityComponent>;
