import type { StoryObj } from '@storybook/angular';

import type { SprintRowComponent } from '@qbc/components';

export const Statuses: StoryObj<SprintRowComponent> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 12px">
        <qbc-sprint-row
          name="Sprint 15"
          status="planned"
          goal="Epic roll-up reporting"
          meta="Oct 13 – Oct 24 · 8 stories · 21 points"
        />
        <qbc-sprint-row
          name="Sprint 14"
          status="active"
          goal="Ship the backlog import and story-point forecasting"
          meta="Sep 29 – Oct 10 · 12 stories · 34 points"
        />
        <qbc-sprint-row
          name="Sprint 13"
          status="completed"
          goal="Assistant availability calendar"
          meta="Sep 15 – Sep 26 · 10 stories · 29 points"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`status` is a pill tone and doubles as the pill's label: planned, active and completed sprints.",
      },
    },
  },
};
