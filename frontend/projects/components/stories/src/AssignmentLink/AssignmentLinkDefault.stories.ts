import type { StoryObj } from '@storybook/angular';

import type { AssignmentLinkComponent } from '@qbc/components';

export const Default: StoryObj<AssignmentLinkComponent> = {
  args: {
    storyKey: 'QBC-142',
    label: 'Schedule assistant availability',
  },
  render: (args) => ({
    props: args,
    template: `<qbc-assignment-link [storyKey]="storyKey" [label]="label" />`,
  }),
};
