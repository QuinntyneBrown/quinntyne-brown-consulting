import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { CardComponent } from '@qbc/components';

import descriptionMd from './CardDescription.md';
import bestPracticesMd from './CardBestPractices.md';

export { Default } from './CardDefault.stories';
export { Padding } from './CardPadding.stories';
export { Raised } from './CardRaised.stories';

export default {
  title: 'Components/Card',
  component: CardComponent,
  decorators: [moduleMetadata({ imports: [CardComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<CardComponent>;
