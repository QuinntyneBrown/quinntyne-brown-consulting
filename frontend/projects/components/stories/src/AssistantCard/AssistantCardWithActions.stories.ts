import type { StoryObj } from '@storybook/angular';

import type { AssistantCardComponent } from '@qbc/components';

export const WithActions: StoryObj<AssistantCardComponent> = {
  render: () => ({
    template: `
      <div style="max-width: 360px">
        <qbc-assistant-card
          name="Daniel Reyes"
          role="QA assistant"
          availability="limited"
          [specialties]="['Regression testing', 'Accessibility']"
          [storyCount]="4"
          [openTaskCount]="7"
        >
          <qbc-button actions variant="secondary" size="sm">Assign story</qbc-button>
        </qbc-assistant-card>
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: 'Content with the `actions` attribute lands in the footer.' } },
  },
};
