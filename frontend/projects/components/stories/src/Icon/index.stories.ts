import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { IconComponent } from '@qbc/components';

import descriptionMd from './IconDescription.md';
import bestPracticesMd from './IconBestPractices.md';

export { Default } from './IconDefault.stories';
export { AllIcons } from './IconAllIcons.stories';
export { Sizes } from './IconSizes.stories';
export { Labelled } from './IconLabelled.stories';

export default {
  title: 'Components/Icon',
  component: IconComponent,
  decorators: [moduleMetadata({ imports: [IconComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<IconComponent>;
