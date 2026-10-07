import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  AppShellComponent,
  BoardColumnComponent,
  BrandComponent,
  ButtonComponent,
  EmptyStateComponent,
  NavItemComponent,
  PageComponent,
  PageHeaderComponent,
  SidebarComponent,
  SprintHeroComponent,
  StoryCardComponent,
  TopbarComponent,
} from '@qbc/components';

import descriptionMd from './SprintBoardDescription.md';

export { ActiveSprint } from './SprintBoardActiveSprint.stories';
export { EmptyColumn } from './SprintBoardEmptyColumn.stories';
export { NoActiveSprint } from './SprintBoardNoActiveSprint.stories';
export { Mobile } from './SprintBoardMobile.stories';

export default {
  title: 'Patterns/Sprint Board',
  decorators: [
    moduleMetadata({
      imports: [
        AppShellComponent,
        SidebarComponent,
        BrandComponent,
        NavItemComponent,
        TopbarComponent,
        PageComponent,
        PageHeaderComponent,
        SprintHeroComponent,
        BoardColumnComponent,
        StoryCardComponent,
        ButtonComponent,
        EmptyStateComponent,
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '760px' },
      description: { component: descriptionMd },
    },
  },
} as Meta;
