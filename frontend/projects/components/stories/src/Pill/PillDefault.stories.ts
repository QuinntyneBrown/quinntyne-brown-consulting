import type { StoryObj } from '@storybook/angular';

import type { PillComponent } from '@qbc/components';

export const Default: StoryObj<PillComponent> = {
  args: {
    tone: 'active',
    label: 'Active',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: [
        'ready',
        'active',
        'done',
        'available',
        'draft',
        'todo',
        'toDo',
        'progress',
        'inProgress',
        'planned',
        'limited',
        'archived',
        'muted',
        'unavailable',
        'completed',
      ],
    },
  },
  render: (args) => ({
    props: args,
    template: `<qbc-pill [tone]="tone" [label]="label" />`,
  }),
};
