import { FormControl } from '@angular/forms';
import type { StoryObj } from '@storybook/angular';

import type { SelectComponent } from '@qbc/components';

export const Groups: StoryObj<SelectComponent> = {
  render: () => ({
    props: {
      epic: new FormControl('auto-estimate'),
      options: [
        { value: null, label: 'No epic' },
        {
          label: 'Self-serve onboarding',
          options: [
            { value: 'signup', label: 'Client sign-up flow' },
            { value: 'import', label: 'Backlog import' },
          ],
        },
        {
          label: 'Assistant automation',
          options: [
            { value: 'auto-estimate', label: 'Auto-estimate new stories' },
            { value: 'triage', label: 'Backlog triage digest', disabled: true },
          ],
        },
      ],
    },
    template: `
      <div style="max-width: 360px">
        <qbc-select label="Epic" required [options]="options" [formControl]="epic" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Items with an `options` array render as an `<optgroup>`, here epics grouped by initiative. Individual options can be `disabled`, and `required` adds an asterisk.',
      },
    },
  },
};
