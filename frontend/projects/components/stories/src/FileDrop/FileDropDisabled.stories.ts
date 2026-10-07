import type { StoryObj } from '@storybook/angular';

import type { FileDropComponent } from '@qbc/components';

export const Disabled: StoryObj<FileDropComponent> = {
  render: () => ({
    template: `
      <qbc-file-drop [disabled]="true" hint="Attachments are locked on archived stories." />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Disabled ignores drags and disables both the picker button and the file input.',
      },
    },
  },
};
