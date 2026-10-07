import type { StoryObj } from '@storybook/angular';

import type { FieldComponent } from '@qbc/components';

export const Required: StoryObj<FieldComponent> = {
  render: () => ({
    template: `
      <qbc-field label="Epic" [required]="true" style="max-width: 320px">
        <select aria-label="Epic" style="width: 100%; padding: 8px 10px; border: 1px solid var(--qbc-line); border-radius: var(--qbc-r-control); background: var(--qbc-panel)">
          <option>Sprint insights</option>
          <option>Assistant onboarding</option>
          <option>Backlog grooming</option>
        </select>
      </qbc-field>
    `,
  }),
  parameters: {
    docs: {
      description: { story: '`required` adds a red asterisk after the label.' },
    },
  },
};
