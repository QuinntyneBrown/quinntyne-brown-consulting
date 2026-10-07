import type { StoryObj } from '@storybook/angular';

import type { AssistantCardComponent } from '@qbc/components';

export const Default: StoryObj<AssistantCardComponent> = {
  args: {
    name: 'Amara Okafor',
    role: 'Delivery assistant',
    availability: 'available',
    specialties: ['Backlog grooming', 'Sprint planning'],
    storyCount: 6,
    openTaskCount: 3,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 360px">
        <qbc-assistant-card
          [name]="name"
          [role]="role"
          [availability]="availability"
          [specialties]="specialties"
          [storyCount]="storyCount"
          [openTaskCount]="openTaskCount"
        />
      </div>
    `,
  }),
};
