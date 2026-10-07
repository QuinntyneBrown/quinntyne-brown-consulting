import type { StoryObj } from '@storybook/angular';

import type { SectionLabelComponent } from '@qbc/components';

export const Default: StoryObj<SectionLabelComponent> = {
  args: {
    heading: 'Ready for planning',
    hint: '6 stories · 29 story points',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 560px">
        <qbc-section-label [heading]="heading" [hint]="hint" />
      </div>
    `,
  }),
};
