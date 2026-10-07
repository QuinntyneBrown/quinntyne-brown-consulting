import type { StoryObj } from '@storybook/angular';

import { FormControl } from '@angular/forms';
import type { TextareaComponent } from '@qbc/components';

export const ReactiveForm: StoryObj<TextareaComponent> = {
  render: () => ({
    props: {
      description: new FormControl(
        'As a planner, I want to import stories from CSV so the backlog is ready before sprint planning.',
      ),
    },
    template: `
      <qbc-textarea label="Story description" [formControl]="description" />
      <p style="font-size: 12px">{{ description.value?.length }} characters</p>
    `,
  }),
  parameters: {
    docs: {
      description: { story: 'Bound to a `FormControl` through its `ControlValueAccessor`.' },
    },
  },
};
