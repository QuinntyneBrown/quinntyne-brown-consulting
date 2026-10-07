import type { StoryObj } from '@storybook/angular';

import type { SkipLinkComponent } from '@qbc/components';

export const CustomLabel: StoryObj<SkipLinkComponent> = {
  render: () => ({
    template: `
      <div style="position: relative; height: 160px; transform: translateZ(0)">
        <qbc-skip-link target="skip-link-backlog-list" label="Skip to backlog stories" />
        <p style="margin: 0">Press Tab inside the preview to reveal the link.</p>
        <section id="skip-link-backlog-list" tabindex="-1" style="margin-top: 16px">
          <h2 style="margin: 0">Backlog · 23 stories</h2>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Point `target` at any focusable element's id and describe where it lands in `label`.",
      },
    },
  },
};
