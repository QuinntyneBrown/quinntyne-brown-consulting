import { FormControl } from '@angular/forms';
import type { StoryObj } from '@storybook/angular';

import type { SelectComponent } from '@qbc/components';

export const Disabled: StoryObj<SelectComponent> = {
  render: () => ({
    props: {
      sprint: new FormControl({ value: 'sprint-14', disabled: true }),
      options: [
        { value: 'sprint-14', label: 'Sprint 14 (active)' },
        { value: 'sprint-15', label: 'Sprint 15' },
      ],
    },
    template: `
      <div style="max-width: 360px">
        <qbc-select
          label="Sprint"
          hint="Completed stories can't be moved to another sprint."
          [options]="options"
          [formControl]="sprint"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Disable it with the `disabled` input or by disabling the bound form control.',
      },
    },
  },
};
