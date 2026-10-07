import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent, EpicRowComponent } from '@qbc/components';

import descriptionMd from './EpicRowDescription.md';
import bestPracticesMd from './EpicRowBestPractices.md';

export { Default } from './EpicRowDefault.stories';
export { List } from './EpicRowList.stories';
export { NotStarted } from './EpicRowNotStarted.stories';
export { Complete } from './EpicRowComplete.stories';

export default {
  title: 'Components/EpicRow',
  component: EpicRowComponent,
  decorators: [moduleMetadata({ imports: [EpicRowComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<EpicRowComponent>;
