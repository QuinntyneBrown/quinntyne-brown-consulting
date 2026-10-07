import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  AppShellComponent,
  BrandComponent,
  ButtonComponent,
  EmptyStateComponent,
  LoadingStateComponent,
  NavItemComponent,
  PageComponent,
  PageHeaderComponent,
  SidebarComponent,
  ToastComponent,
  TopbarComponent,
} from '@qbc/components';

import descriptionMd from './WorkspaceShellDescription.md';

export { Desktop } from './WorkspaceShellDesktop.stories';
export { Mobile, MobileDrawerOpen } from './WorkspaceShellMobile.stories';
export { Feedback } from './WorkspaceShellFeedback.stories';

export default {
  title: 'Patterns/Workspace Shell',
  decorators: [
    moduleMetadata({
      imports: [
        AppShellComponent,
        SidebarComponent,
        BrandComponent,
        NavItemComponent,
        TopbarComponent,
        ButtonComponent,
        PageComponent,
        PageHeaderComponent,
        EmptyStateComponent,
        LoadingStateComponent,
        ToastComponent,
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '640px' },
      description: { component: descriptionMd },
    },
  },
} as Meta;
