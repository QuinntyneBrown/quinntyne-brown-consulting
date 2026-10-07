import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ToastComponent } from '@qbc/components';

import descriptionMd from './ToastDescription.md';
import bestPracticesMd from './ToastBestPractices.md';

export { Default } from './ToastDefault.stories';
export { Error } from './ToastError.stories';
export { Stack } from './ToastStack.stories';

export default {
  title: 'Components/Toast',
  component: ToastComponent,
  decorators: [moduleMetadata({ imports: [ToastComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<ToastComponent>;
