import type { StoryObj } from '@storybook/angular';

import type { SkipLinkComponent } from '@qbc/components';

export const Default: StoryObj<SkipLinkComponent> = {
  args: {
    target: 'skip-link-default-main',
    label: 'Skip to content',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; height: 160px; transform: translateZ(0)">
        <qbc-skip-link [target]="target" [label]="label" />
        <p style="margin: 0">Press Tab inside the preview to reveal the link.</p>
        <main id="skip-link-default-main" tabindex="-1" style="margin-top: 16px">
          <h2 style="margin: 0">Sprint 14 board</h2>
        </main>
      </div>
    `,
  }),
};
