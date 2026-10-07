import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent, SectionLabelComponent } from '@qbc/components';

import descriptionMd from './SectionLabelDescription.md';
import bestPracticesMd from './SectionLabelBestPractices.md';

export { Default } from './SectionLabelDefault.stories';
export { WithAction } from './SectionLabelWithAction.stories';
export { HeadingOnly } from './SectionLabelHeadingOnly.stories';

export default {
  title: 'Components/SectionLabel',
  component: SectionLabelComponent,
  decorators: [moduleMetadata({ imports: [SectionLabelComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<SectionLabelComponent>;
