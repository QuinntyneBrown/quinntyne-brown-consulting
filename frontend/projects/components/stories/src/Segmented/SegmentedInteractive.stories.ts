import type { StoryObj } from '@storybook/angular';

import type { SegmentedComponent } from '@qbc/components';

export const Interactive: StoryObj<SegmentedComponent> = {
  render: () => ({
    props: {
      filter: 'all',
      filters: [
        { value: 'all', label: 'All' },
        { value: 'todo', label: 'To do' },
        { value: 'inProgress', label: 'In progress' },
        { value: 'done', label: 'Done' },
      ],
    },
    template: `
      <div style="display: inline-block">
        <qbc-segmented
          ariaLabel="Filter stories by status"
          [options]="filters"
          [selected]="filter"
          (selectedChange)="filter = $event"
        />
      </div>
      <p>Showing: <strong>{{ filter }}</strong></p>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The component is controlled: it emits `selectedChange` and the parent feeds the new value back into `selected`.',
      },
    },
  },
};
