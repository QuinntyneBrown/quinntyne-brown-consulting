import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { FileDropComponent } from '@qbc/components';

import descriptionMd from './FileDropDescription.md';
import bestPracticesMd from './FileDropBestPractices.md';

export { Default } from './FileDropDefault.stories';
export { Compact } from './FileDropCompact.stories';
export { Disabled } from './FileDropDisabled.stories';

export default {
  title: 'Components/FileDrop',
  component: FileDropComponent,
  decorators: [moduleMetadata({ imports: [FileDropComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<FileDropComponent>;
