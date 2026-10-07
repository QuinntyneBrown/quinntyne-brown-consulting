import type { StoryObj } from '@storybook/angular';

import type { SidebarComponent } from '@qbc/components';

export const MultilineFooter: StoryObj<SidebarComponent> = {
  render: () => ({
    template: `
      <div style="position: relative; height: 520px; transform: translateZ(0); overflow: hidden">
        <qbc-sidebar footer="Quinntyne Brown Consulting Inc.\nWorkboard v2.4 · Sprint 14">
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
          'The footer keeps line breaks (`white-space: pre-line`), so a newline in `footer` starts a new line.',
      },
    },
  },
};
