import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { IconButtonComponent } from '@qbc/components';

import descriptionMd from './IconButtonDescription.md';
import bestPracticesMd from './IconButtonBestPractices.md';

export { Default } from './IconButtonDefault.stories';
export { Variants } from './IconButtonVariants.stories';
export { Disabled } from './IconButtonDisabled.stories';
export { Toolbar } from './IconButtonToolbar.stories';

export default {
  title: 'Components/IconButton',
  component: IconButtonComponent,
  decorators: [moduleMetadata({ imports: [IconButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<IconButtonComponent>;
