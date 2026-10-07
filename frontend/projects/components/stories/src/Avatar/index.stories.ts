import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { AvatarComponent } from '@qbc/components';

import descriptionMd from './AvatarDescription.md';
import bestPracticesMd from './AvatarBestPractices.md';

export { Default } from './AvatarDefault.stories';
export { Size } from './AvatarSize.stories';
export { Unassigned } from './AvatarUnassigned.stories';

export default {
  title: 'Components/Avatar',
  component: AvatarComponent,
  decorators: [moduleMetadata({ imports: [AvatarComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<AvatarComponent>;
