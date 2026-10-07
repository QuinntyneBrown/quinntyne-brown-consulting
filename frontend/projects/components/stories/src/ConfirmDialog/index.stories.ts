import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent, ConfirmDialogComponent } from '@qbc/components';

import descriptionMd from './ConfirmDialogDescription.md';
import bestPracticesMd from './ConfirmDialogBestPractices.md';

export { Default } from './ConfirmDialogDefault.stories';
export { DeleteSprint } from './ConfirmDialogDeleteSprint.stories';
export { ArchiveEpic } from './ConfirmDialogArchiveEpic.stories';

export default {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialogComponent,
  decorators: [moduleMetadata({ imports: [ConfirmDialogComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<ConfirmDialogComponent>;
