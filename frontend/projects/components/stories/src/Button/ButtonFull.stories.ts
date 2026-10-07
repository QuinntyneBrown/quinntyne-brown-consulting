import type { StoryObj } from '@storybook/angular';

import type { ButtonComponent } from '@qbc/components';

export const Full: StoryObj<ButtonComponent> = {
  render: () => ({
    template: `
      <div style="max-width: 320px">
        <qbc-button type="submit" full>Sign in</qbc-button>
      </div>
    `,
  }),
  parameters: {
    docs: { description: { story: '`full` stretches the button to the container width.' } },
  },
};
