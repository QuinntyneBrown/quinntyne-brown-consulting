import type { StoryObj } from '@storybook/angular';

import type { TextInputComponent } from '@qbc/components';

export const WithIcon: StoryObj<TextInputComponent> = {
  render: () => ({
    template: `
      <qbc-text-input
        type="search"
        icon="search"
        label="Search backlog"
        labelHidden
        placeholder="Search stories, epics and initiatives"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`icon` adds a leading icon; with `labelHidden` the label stays available to screen readers only.',
      },
    },
  },
};
