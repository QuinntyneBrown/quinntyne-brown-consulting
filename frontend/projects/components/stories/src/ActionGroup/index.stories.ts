import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ActionGroupComponent, ButtonComponent } from '@qbc/components';

import descriptionMd from './ActionGroupDescription.md';
import bestPracticesMd from './ActionGroupBestPractices.md';

export { Default } from './ActionGroupDefault.stories';
export { Start } from './ActionGroupStart.stories';
export { Between } from './ActionGroupBetween.stories';

export default {
  title: 'Components/ActionGroup',
  component: ActionGroupComponent,
  decorators: [moduleMetadata({ imports: [ActionGroupComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<ActionGroupComponent>;
