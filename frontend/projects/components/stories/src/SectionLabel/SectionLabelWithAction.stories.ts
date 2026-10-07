import type { StoryObj } from '@storybook/angular';

import type { SectionLabelComponent } from '@qbc/components';

export const WithAction: StoryObj<SectionLabelComponent> = {
  render: () => ({
    template: `
      <div style="max-width: 560px">
        <qbc-section-label heading="Tasks" hint="3 of 5 done">
          <qbc-button variant="quiet" size="xs">Add task</qbc-button>
        </qbc-section-label>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Projected content sits at the trailing edge, level with the heading.',
      },
    },
  },
};
