import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent, SprintHeroComponent } from '@qbc/components';

import descriptionMd from './SprintHeroDescription.md';
import bestPracticesMd from './SprintHeroBestPractices.md';

export { Default } from './SprintHeroDefault.stories';
export { WithActions } from './SprintHeroWithActions.stories';
export { NotStarted } from './SprintHeroNotStarted.stories';

export default {
  title: 'Components/SprintHero',
  component: SprintHeroComponent,
  decorators: [moduleMetadata({ imports: [SprintHeroComponent, ButtonComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<SprintHeroComponent>;
