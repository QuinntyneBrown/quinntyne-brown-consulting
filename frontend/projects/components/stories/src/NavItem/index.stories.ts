import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { NavItemComponent } from '@qbc/components';

import descriptionMd from './NavItemDescription.md';
import bestPracticesMd from './NavItemBestPractices.md';

export { Default } from './NavItemDefault.stories';
export { Navigation } from './NavItemNavigation.stories';

export default {
  title: 'Components/NavItem',
  component: NavItemComponent,
  decorators: [moduleMetadata({ imports: [NavItemComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<NavItemComponent>;
