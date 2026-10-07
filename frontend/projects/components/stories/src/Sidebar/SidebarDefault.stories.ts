import type { StoryObj } from '@storybook/angular';

import type { SidebarComponent } from '@qbc/components';

export const Default: StoryObj<SidebarComponent> = {
  args: {
    open: false,
    footer: 'Quinntyne Brown Consulting Inc.',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; height: 520px; transform: translateZ(0); overflow: hidden">
        <qbc-sidebar [open]="open" [footer]="footer">
          <span brand><qbc-brand /></span>
          <qbc-nav-item icon="board" label="Board" href="/board" />
          <qbc-nav-item icon="backlog" label="Backlog" href="/backlog" />
          <qbc-nav-item icon="initiatives" label="Initiatives" href="/initiatives" />
          <qbc-nav-item icon="assistants" label="Assistants" href="/assistants" />
        </qbc-sidebar>
      </div>
    `,
  }),
};
