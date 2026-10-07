import type { StoryObj } from '@storybook/angular';

import type { SegmentedComponent } from '@qbc/components';

export const WithTitles: StoryObj<SegmentedComponent> = {
  render: () => ({
    props: {
      options: [
        { value: 'sprint', label: 'Sprint', title: 'Stories committed to the current sprint' },
        { value: 'backlog', label: 'Backlog', title: 'Stories not yet planned' },
        { value: 'epic', label: 'By epic', title: 'Stories grouped under their epic' },
      ],
    },
    template: `
      <div style="display: inline-block">
        <qbc-segmented ariaLabel="Story scope" [options]="options" selected="backlog" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'An option’s optional `title` becomes the button tooltip.',
      },
    },
  },
};
