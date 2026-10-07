import type { StoryObj } from '@storybook/angular';

import type { FileDropComponent } from '@qbc/components';

export const Compact: StoryObj<FileDropComponent> = {
  render: () => ({
    template: `
      <qbc-file-drop variant="compact" heading="Drop more files" chooseLabel="browse" hint="PNG, PDF or Markdown." />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'A single-line bar for a list that already has attachments.',
      },
    },
  },
};
