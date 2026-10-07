import type { StoryObj } from '@storybook/angular';

import type { TextareaComponent } from '@qbc/components';

export const States: StoryObj<TextareaComponent> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px; max-width: 480px">
        <qbc-textarea label="Sprint goal" required value="Ship the backlog import and story-point forecasting" />
        <qbc-textarea label="Initiative summary" readonly value="Cut sprint planning time in half by importing and forecasting the backlog." />
        <qbc-textarea label="Retro notes" disabled placeholder="Available after the sprint ends" />
      </div>
    `,
  }),
  parameters: { docs: { description: { story: 'Required, read-only and disabled fields.' } } },
};
