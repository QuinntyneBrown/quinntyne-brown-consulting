import type { StoryObj } from '@storybook/angular';

import { FormControl } from '@angular/forms';
import type { TextInputComponent } from '@qbc/components';

export const ReactiveForm: StoryObj<TextInputComponent> = {
  render: () => ({
    props: {
      points: new FormControl('5'),
    },
    template: `
      <qbc-text-input
        label="Story points"
        type="number"
        [min]="0"
        [step]="0.5"
        [formControl]="points"
      />
      <p style="font-size: 12px">Value: {{ points.value }}</p>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The input is a `ControlValueAccessor`; here a `FormControl` drives a number field with `min` and `step`.',
      },
    },
  },
};
