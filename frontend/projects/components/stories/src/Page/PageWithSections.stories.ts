import type { StoryObj } from '@storybook/angular';

import type { PageComponent } from '@qbc/components';

export const WithSections: StoryObj<PageComponent> = {
  render: () => ({
    template: `
      <div style="padding: 32px 24px">
        <qbc-page>
          <qbc-page-header
            title="Backlog"
            description="Every story not yet planned into a sprint, ordered by priority."
          >
            <qbc-button actions>Add story</qbc-button>
          </qbc-page-header>
          <qbc-section-label heading="Ready for planning" hint="6 stories · 29 story points" />
          <p>Stories that have been estimated and refined.</p>
          <qbc-section-label heading="Needs refinement" hint="4 stories · not estimated" />
          <p>Stories still missing acceptance criteria or an estimate.</p>
        </qbc-page>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'A page header followed by labelled sections, all held to the page max width.',
      },
    },
  },
};
