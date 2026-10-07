import type { StoryObj } from '@storybook/angular';

import type { FileDropComponent } from '@qbc/components';

export const Default: StoryObj<FileDropComponent> = {
  args: {
    variant: 'full',
    heading: 'Drop files here',
    hint: 'Attach mockups, specs or notes to this story. Up to 10 MB each.',
    chooseLabel: 'Choose files',
    inputLabel: 'Attach files',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-file-drop
        [variant]="variant"
        [heading]="heading"
        [hint]="hint"
        [chooseLabel]="chooseLabel"
        [inputLabel]="inputLabel"
        [disabled]="disabled"
      />
    `,
  }),
};
