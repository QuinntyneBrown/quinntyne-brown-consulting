import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { BrandComponent, NavItemComponent, SidebarComponent } from '@qbc/components';

import descriptionMd from './SidebarDescription.md';
import bestPracticesMd from './SidebarBestPractices.md';

export { Default } from './SidebarDefault.stories';
export { Open } from './SidebarOpen.stories';
export { MultilineFooter } from './SidebarMultilineFooter.stories';

export default {
  title: 'Components/Sidebar',
  component: SidebarComponent,
  decorators: [moduleMetadata({ imports: [SidebarComponent, BrandComponent, NavItemComponent] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<SidebarComponent>;
