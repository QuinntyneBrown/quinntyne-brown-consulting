import type { StoryObj } from '@storybook/angular';

import type { FieldComponent } from '@qbc/components';

export const FullWidth: StoryObj<FieldComponent> = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px">
        <qbc-field label="Initiative">
          <input aria-label="Initiative" value="Client reporting" style="width: 100%; padding: 8px 10px; border: 1px solid var(--qbc-line); border-radius: var(--qbc-r-control); background: var(--qbc-panel)" />
        </qbc-field>
        <qbc-field label="Owner">
          <input aria-label="Owner" value="Quinntyne Brown" style="width: 100%; padding: 8px 10px; border: 1px solid var(--qbc-line); border-radius: var(--qbc-r-control); background: var(--qbc-panel)" />
        </qbc-field>
        <qbc-field label="Acceptance criteria" hint="One criterion per line." [full]="true">
          <textarea aria-label="Acceptance criteria" rows="3" style="width: 100%; padding: 8px 10px; border: 1px solid var(--qbc-line); border-radius: var(--qbc-r-control); background: var(--qbc-panel)">The PDF lists every story in the sprint.</textarea>
        </qbc-field>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: { story: '`full` spans every column of a two-column form grid.' },
    },
  },
};
