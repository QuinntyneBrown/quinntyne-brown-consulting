import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  ButtonComponent,
  DataRowComponent,
  PointsComponent,
  SelectComponent,
  StatusPillComponent,
  TagComponent,
} from '@qbc/components';

import descriptionMd from './DataRowDescription.md';
import bestPracticesMd from './DataRowBestPractices.md';

export { Default } from './DataRowDefault.stories';
export { Backlog } from './DataRowBacklog.stories';
export { Unassigned } from './DataRowUnassigned.stories';
export { IdentityOnly } from './DataRowIdentityOnly.stories';

export default {
  title: 'Components/DataRow',
  component: DataRowComponent,
  decorators: [
    moduleMetadata({
      imports: [
        DataRowComponent,
        StatusPillComponent,
        PointsComponent,
        SelectComponent,
        ButtonComponent,
        TagComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<DataRowComponent>;
