import type { StoryObj } from '@storybook/angular';

import type { ConfirmDialogComponent } from '@qbc/components';

export const Default: StoryObj<ConfirmDialogComponent> = {
  args: {
    title: 'Remove this story?',
    copy: 'QBC-142 "Export sprint report as PDF" will be removed from the backlog.',
    confirmLabel: 'Remove story',
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-button variant="danger" (click)="confirm.open(title, copy, confirmLabel)">Remove story</qbc-button>
      <qbc-confirm-dialog #confirm />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The trigger calls `open(title, copy, confirmLabel)`; the dialog stays closed until then.',
      },
    },
  },
};
