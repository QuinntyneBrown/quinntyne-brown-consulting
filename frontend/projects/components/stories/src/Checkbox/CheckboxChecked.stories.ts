import type { StoryObj } from '@storybook/angular';

import type { CheckboxComponent } from '@qbc/components';

export const Checked: StoryObj<CheckboxComponent> = {
  render: () => ({
    template: `<qbc-checkbox label="Notify assistants when the sprint starts" [value]="true" />`,
  }),
  parameters: {
    docs: { description: { story: 'Checked via the `value` input.' } },
  },
};
