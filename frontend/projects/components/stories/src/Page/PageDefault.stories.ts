import type { StoryObj } from '@storybook/angular';

import type { PageComponent } from '@qbc/components';

export const Default: StoryObj<PageComponent> = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 32px 24px">
        <qbc-page>
          <qbc-page-header
            title="Initiatives"
            description="The outcomes this quarter's epics and stories roll up to."
          />
          <p>Initiative cards render here.</p>
        </qbc-page>
      </div>
    `,
  }),
};
