import type { StoryObj } from '@storybook/angular';

import type { IconButtonComponent } from '@qbc/components';

export const Toolbar: StoryObj<IconButtonComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; align-items: center">
        <qbc-icon-button icon="menu" label="Open navigation" [ariaExpanded]="false" />
        <qbc-icon-button icon="search" label="Search backlog" />
        <qbc-icon-button icon="upload" label="Upload attachment" />
        <qbc-icon-button icon="download" label="Download sprint report" />
        <qbc-icon-button icon="retry" label="Retry sync" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A row of actions; `ariaExpanded` reports the state of a disclosure such as the menu.',
      },
    },
  },
};
