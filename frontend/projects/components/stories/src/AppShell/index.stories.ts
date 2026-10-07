import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  AppShellComponent,
  AvatarComponent,
  BrandComponent,
  NavItemComponent,
  PageHeaderComponent,
  SidebarComponent,
  ToastComponent,
  TopbarComponent,
} from '@qbc/components';

import descriptionMd from './AppShellDescription.md';
import bestPracticesMd from './AppShellBestPractices.md';

export { Default } from './AppShellDefault.stories';
export { WithFeedback } from './AppShellWithFeedback.stories';

export default {
  title: 'Components/AppShell',
  component: AppShellComponent,
  decorators: [
    moduleMetadata({
      imports: [
        AppShellComponent,
        SidebarComponent,
        BrandComponent,
        NavItemComponent,
        TopbarComponent,
        AvatarComponent,
        PageHeaderComponent,
        ToastComponent,
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      // The sidebar is position: fixed, so render each story in its own iframe.
      story: { inline: false, iframeHeight: 520 },
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<AppShellComponent>;
