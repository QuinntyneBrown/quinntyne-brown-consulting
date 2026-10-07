import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  AppShellComponent,
  BrandComponent,
  ButtonComponent,
  DataRowComponent,
  EmptyStateComponent,
  EpicRowComponent,
  FormErrorComponent,
  InitiativeCardComponent,
  LoadingStateComponent,
  NavItemComponent,
  PageComponent,
  PageHeaderComponent,
  PointsComponent,
  SelectComponent,
  SidebarComponent,
  StatusPillComponent,
  TagComponent,
  TextInputComponent,
  TopbarComponent,
} from '@qbc/components';

import descriptionMd from './BacklogDescription.md';

export { StoryList } from './BacklogStoryList.stories';
export { Initiatives } from './BacklogInitiatives.stories';
export { NoMatches } from './BacklogNoMatches.stories';
export { LoadError } from './BacklogLoadError.stories';
export { Mobile } from './BacklogMobile.stories';

export default {
  title: 'Patterns/Backlog',
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
        TextInputComponent,
        SelectComponent,
        DataRowComponent,
        StatusPillComponent,
        TagComponent,
        PointsComponent,
        InitiativeCardComponent,
        EpicRowComponent,
        EmptyStateComponent,
        FormErrorComponent,
        LoadingStateComponent,
        ButtonComponent,
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
