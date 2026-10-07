import type { StoryObj } from '@storybook/angular';

import type { CardComponent } from '@qbc/components';

export const Default: StoryObj<CardComponent> = {
  args: {
    padding: 'md',
    interactive: false,
    raised: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 360px">
        <qbc-card [padding]="padding" [interactive]="interactive" [raised]="raised">
          <h3 style="margin: 0 0 6px">Sprint 14</h3>
          <p style="margin: 0">12 stories, 34 story points. Ends Friday.</p>
        </qbc-card>
      </div>
    `,
  }),
};
