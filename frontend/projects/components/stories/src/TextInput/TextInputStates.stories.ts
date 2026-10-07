import type { StoryObj } from '@storybook/angular';

import type { TextInputComponent } from '@qbc/components';

export const States: StoryObj<TextInputComponent> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; max-width: 360px">
        <qbc-text-input label="Sprint name" value="Sprint 14" required />
        <qbc-text-input label="Story key" value="QBC-142" readonly hint="Assigned when the story is created." />
        <qbc-text-input label="Initiative" value="Faster planning" disabled />
        <qbc-text-input label="Compact" size="sm" placeholder="Task title" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Required (asterisk), read-only with a hint, disabled, and the compact `sm` size.',
      },
    },
  },
};
