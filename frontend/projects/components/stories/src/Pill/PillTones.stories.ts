import type { StoryObj } from '@storybook/angular';

import type { PillComponent } from '@qbc/components';

export const Tones: StoryObj<PillComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
        <qbc-pill tone="ready" label="Ready" />
        <qbc-pill tone="active" label="Active" />
        <qbc-pill tone="done" label="Done" />
        <qbc-pill tone="draft" label="Draft" />
        <qbc-pill tone="toDo" label="To do" />
        <qbc-pill tone="inProgress" label="In progress" />
        <qbc-pill tone="planned" label="Planned" />
        <qbc-pill tone="limited" label="Limited" />
        <qbc-pill tone="completed" label="Completed" />
        <qbc-pill tone="archived" label="Archived" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Tones fall into four colour families: accent (ready, active, done, available), blue (draft, todo, toDo), amber (progress, inProgress, planned, limited) and muted (archived, completed, muted, unavailable).',
      },
    },
  },
};
