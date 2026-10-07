import type { StoryObj } from '@storybook/angular';

import type { BrandComponent } from '@qbc/components';

export const CustomTagline: StoryObj<BrandComponent> = {
  render: () => ({
    template: `<qbc-brand tagline="Staging" href="/backlog" />`,
  }),
  parameters: {
    docs: { description: { story: 'A different tagline, e.g. to mark a staging environment.' } },
  },
};
