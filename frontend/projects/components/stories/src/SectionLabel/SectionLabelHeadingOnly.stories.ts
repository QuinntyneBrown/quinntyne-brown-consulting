import type { StoryObj } from '@storybook/angular';

import type { SectionLabelComponent } from '@qbc/components';

export const HeadingOnly: StoryObj<SectionLabelComponent> = {
  render: () => ({
    template: `<qbc-section-label heading="Acceptance criteria" />`,
  }),
  parameters: {
    docs: {
      description: { story: 'An empty `hint` is not rendered.' },
    },
  },
};
