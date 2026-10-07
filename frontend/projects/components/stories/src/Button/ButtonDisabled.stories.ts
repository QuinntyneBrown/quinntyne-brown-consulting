import type { StoryObj } from '@storybook/angular';

import type { ButtonComponent } from '@qbc/components';

export const Disabled: StoryObj<ButtonComponent> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center">
        <qbc-button disabled>Start sprint</qbc-button>
        <qbc-button variant="secondary" disabled>Edit sprint</qbc-button>
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: 'Disabled, e.g. while the sprint has no stories.' } },
  },
};
