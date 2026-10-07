import type { StoryObj } from '@storybook/angular';

import type { CheckboxComponent } from '@qbc/components';

export const Disabled: StoryObj<CheckboxComponent> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 8px">
        <qbc-checkbox label="Archive the backlog" disabled />
        <qbc-checkbox label="Lock sprint scope" [value]="true" disabled />
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: 'Disabled, unchecked and checked.' } },
  },
};
