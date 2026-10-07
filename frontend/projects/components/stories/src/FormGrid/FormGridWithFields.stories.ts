import type { StoryObj } from '@storybook/angular';

import type { FormGridComponent } from '@qbc/components';

export const WithFields: StoryObj<FormGridComponent> = {
  render: () => ({
    template: `
      <qbc-form-grid>
        <qbc-field label="Start date">
          <input type="date" aria-label="Start date" value="2026-03-03" style="width: 100%; padding: 8px 10px; border: 1px solid var(--qbc-line); border-radius: var(--qbc-r-control); background: var(--qbc-panel)" />
        </qbc-field>
        <qbc-field label="End date">
          <input type="date" aria-label="End date" value="2026-03-14" style="width: 100%; padding: 8px 10px; border: 1px solid var(--qbc-line); border-radius: var(--qbc-r-control); background: var(--qbc-panel)" />
        </qbc-field>
        <qbc-field label="Sprint goal" hint="One sentence the team can repeat." [full]="true">
          <input aria-label="Sprint goal" value="Ship client reporting" style="width: 100%; padding: 8px 10px; border: 1px solid var(--qbc-line); border-radius: var(--qbc-r-control); background: var(--qbc-panel)" />
        </qbc-field>
      </qbc-form-grid>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '`qbc-field` wraps custom controls and honours the same `full` span.',
      },
    },
  },
};
