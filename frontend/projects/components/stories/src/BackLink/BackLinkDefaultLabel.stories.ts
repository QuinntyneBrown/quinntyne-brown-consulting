import type { StoryObj } from '@storybook/angular';

import type { BackLinkComponent } from '@qbc/components';

export const DefaultLabel: StoryObj<BackLinkComponent> = {
  render: () => ({
    template: `<qbc-back-link href="/sprints" />`,
  }),
  parameters: {
    docs: { description: { story: 'Without a `label` the link reads "Back".' } },
  },
};
