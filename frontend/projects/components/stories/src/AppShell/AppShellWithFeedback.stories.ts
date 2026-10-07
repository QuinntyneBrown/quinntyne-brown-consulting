import type { StoryObj } from '@storybook/angular';

import type { AppShellComponent } from '@qbc/components';

export const WithFeedback: StoryObj<AppShellComponent> = {
  render: () => ({
    template: `
      <qbc-app-shell>
        <qbc-sidebar navigation>
          <qbc-brand brand />
          <qbc-nav-item icon="board" label="Board" href="/board" />
          <qbc-nav-item icon="backlog" label="Backlog" href="/backlog" />
          <qbc-nav-item icon="initiatives" label="Initiatives" href="/initiatives" />
          <qbc-nav-item icon="assistants" label="Assistants" href="/assistants" />
        </qbc-sidebar>
        <qbc-topbar topbar breadcrumb="Workspace / Board">
          <qbc-avatar name="Quinntyne Brown" size="lg" />
        </qbc-topbar>
        <div content>
          <qbc-page-header title="Sprint 14 board" description="Ship the assistant scheduling flow." />
        </div>
        <qbc-toast feedback>Story QBC-142 moved to In review</qbc-toast>
      </qbc-app-shell>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'A toast in the `[feedback]` slot is pinned bottom-right and announced politely.',
      },
    },
  },
};
