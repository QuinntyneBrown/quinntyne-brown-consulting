import type { StoryObj } from '@storybook/angular';

import type { StatusPillComponent } from '@qbc/components';

export const Tones: StoryObj<StatusPillComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <qbc-status-pill tone="toDo" label="To do" />
        <qbc-status-pill tone="inProgress" label="In progress" />
        <qbc-status-pill tone="done" label="Done" />
        <qbc-status-pill tone="ready" label="Ready" />
        <qbc-status-pill tone="draft" label="Draft" />
        <qbc-status-pill tone="available" label="Available" />
        <qbc-status-pill tone="limited" label="Limited" />
        <qbc-status-pill tone="unavailable" label="Unavailable" />
        <qbc-status-pill tone="archived" label="Archived" />
        <qbc-status-pill tone="muted" label="Muted" />
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: 'The tones used for story, initiative and assistant states.' } },
  },
};
