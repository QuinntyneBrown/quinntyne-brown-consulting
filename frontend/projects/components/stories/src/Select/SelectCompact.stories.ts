import type { StoryObj } from '@storybook/angular';

import type { SelectComponent } from '@qbc/components';

export const Compact: StoryObj<SelectComponent> = {
  render: () => ({
    props: {
      options: [
        { value: 'priority', label: 'Priority' },
        { value: 'points', label: 'Story points' },
        { value: 'updated', label: 'Recently updated' },
      ],
    },
    template: `
      <div style="max-width: 220px">
        <qbc-select label="Sort backlog by" labelHidden size="sm" value="priority" [options]="options" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`size="sm"` is a 34px control for toolbars; `labelHidden` keeps the label for screen readers only.',
      },
    },
  },
};
