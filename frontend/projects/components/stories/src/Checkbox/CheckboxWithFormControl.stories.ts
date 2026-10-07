import { FormControl } from '@angular/forms';
import type { StoryObj } from '@storybook/angular';

import type { CheckboxComponent } from '@qbc/components';

export const WithFormControl: StoryObj<CheckboxComponent> = {
  render: () => ({
    props: { control: new FormControl(true) },
    template: `
      <qbc-checkbox label="Show story points on cards" [formControl]="control" />
      <p>Value: {{ control.value }}</p>
    `,
  }),
  parameters: {
    docs: { description: { story: 'Bound to a reactive `FormControl`.' } },
  },
};
