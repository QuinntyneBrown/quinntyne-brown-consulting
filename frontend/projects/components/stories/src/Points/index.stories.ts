import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { PointsComponent } from '@qbc/components';

import descriptionMd from './PointsDescription.md';
import bestPracticesMd from './PointsBestPractices.md';

export { Default } from './PointsDefault.stories';
export { Scale } from './PointsScale.stories';
export { NotEstimated } from './PointsNotEstimated.stories';

export default {
  title: 'Components/Points',
  component: PointsComponent,
  decorators: [moduleMetadata({ imports: [PointsComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<PointsComponent>;
