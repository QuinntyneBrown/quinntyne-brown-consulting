import type { StoryObj } from '@storybook/angular';

import type { StatusPillComponent } from '@qbc/components';

export const Default: StoryObj<StatusPillComponent> = {
  args: {
    tone: 'inProgress',
    label: 'In progress',
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
    template: `<qbc-status-pill [tone]="tone" [label]="label" />`,
  }),
};
