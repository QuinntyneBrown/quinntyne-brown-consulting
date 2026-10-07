import type { StoryObj } from '@storybook/angular';

import type { SidebarComponent } from '@qbc/components';

export const Open: StoryObj<SidebarComponent> = {
  render: () => ({
    template: `
      <div style="position: relative; height: 520px; transform: translateZ(0); overflow: hidden">
        <qbc-sidebar [open]="true">
          <span brand><qbc-brand /></span>
          <qbc-nav-item icon="board" label="Board" href="/board" />
          <qbc-nav-item icon="backlog" label="Backlog" href="/backlog" />
          <qbc-nav-item icon="initiatives" label="Initiatives" href="/initiatives" />
          <qbc-nav-item icon="assistants" label="Assistants" href="/assistants" />
        </qbc-sidebar>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`open` slides the drawer in below 900px. Switch the viewport to Mobile to see the difference; on wider screens the sidebar is always shown.',
      },
    },
  },
};
