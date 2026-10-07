import type { StoryObj } from '@storybook/angular';

import type { BrandComponent } from '@qbc/components';

export const Default: StoryObj<BrandComponent> = {
  args: {
    mark: 'Q',
    name: 'QBC',
    tagline: 'Workboard',
    href: '/board',
  },
  render: (args) => ({
    props: args,
    template: `<qbc-brand [mark]="mark" [name]="name" [tagline]="tagline" [href]="href" />`,
  }),
};
