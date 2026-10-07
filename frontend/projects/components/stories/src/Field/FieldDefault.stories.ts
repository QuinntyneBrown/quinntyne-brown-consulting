import type { StoryObj } from '@storybook/angular';

import type { FieldComponent } from '@qbc/components';

export const Default: StoryObj<FieldComponent> = {
  args: {
    label: 'Story points',
    hint: 'Use the Fibonacci scale: 1, 2, 3, 5, 8, 13.',
    required: false,
    full: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-field [label]="label" [hint]="hint" [required]="required" [full]="full" style="max-width: 320px">
        <input type="number" aria-label="Story points" value="5" style="width: 100%; padding: 8px 10px; border: 1px solid var(--qbc-line); border-radius: var(--qbc-r-control); background: var(--qbc-panel)" />
      </qbc-field>
    `,
  }),
};
