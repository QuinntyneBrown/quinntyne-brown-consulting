import type { StoryObj } from '@storybook/angular';

import type { SprintHeroComponent } from '@qbc/components';

export const WithActions: StoryObj<SprintHeroComponent> = {
  render: () => ({
    template: `
      <qbc-sprint-hero
        goal="Assistant onboarding for the Initiatives area"
        dates="Oct 13 – Oct 24, 2026"
        [complete]="11"
        [total]="11"
      >
        <qbc-button actions variant="secondary" size="sm">Complete sprint</qbc-button>
      </qbc-sprint-hero>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Content with the `actions` attribute is projected under the progress bar, e.g. a sprint action.',
      },
    },
  },
};
