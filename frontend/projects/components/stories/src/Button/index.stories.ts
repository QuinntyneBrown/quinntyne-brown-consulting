import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent } from '@qbc/components';

import descriptionMd from './ButtonDescription.md';
import bestPracticesMd from './ButtonBestPractices.md';

export { Default } from './ButtonDefault.stories';
export { Variants } from './ButtonVariants.stories';
export { Sizes } from './ButtonSizes.stories';
export { Disabled } from './ButtonDisabled.stories';
export { Full } from './ButtonFull.stories';

export default {
  title: 'Components/Button',
  component: ButtonComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<ButtonComponent>;
