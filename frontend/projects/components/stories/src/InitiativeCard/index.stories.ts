import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  ButtonComponent,
  InitiativeCardComponent,
  PillComponent,
  PointsComponent,
  ProgressComponent,
} from '@qbc/components';

import descriptionMd from './InitiativeCardDescription.md';
import bestPracticesMd from './InitiativeCardBestPractices.md';

export { Default } from './InitiativeCardDefault.stories';
export { WithActions } from './InitiativeCardWithActions.stories';
export { WithEpics } from './InitiativeCardWithEpics.stories';
export { Untitled } from './InitiativeCardUntitled.stories';

export default {
  title: 'Components/InitiativeCard',
  component: InitiativeCardComponent,
  decorators: [
    moduleMetadata({
      imports: [
        InitiativeCardComponent,
        ButtonComponent,
        PillComponent,
        PointsComponent,
        ProgressComponent,
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
} as Meta<InitiativeCardComponent>;
