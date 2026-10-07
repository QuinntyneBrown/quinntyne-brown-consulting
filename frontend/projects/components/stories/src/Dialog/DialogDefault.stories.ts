import type { StoryObj } from '@storybook/angular';

import type { DialogComponent } from '@qbc/components';

export const Default: StoryObj<DialogComponent> = {
  args: {
    title: 'Sprint 14 goal',
    subtitle: 'Mar 3 – Mar 14 · 34 story points committed',
    size: 'md',
    closeLabel: 'Close dialog',
  },
  render: (args) => ({
    props: args,
    template: `
      <qbc-button (click)="dialog.open()">Open dialog</qbc-button>
      <qbc-dialog #dialog [title]="title" [subtitle]="subtitle" [size]="size" [closeLabel]="closeLabel">
        <p body style="margin: 0">
          Ship the client sprint report export and invite the first two assistants to the workboard.
        </p>
        <qbc-button actions variant="secondary" (click)="dialog.close()">Close</qbc-button>
        <qbc-button actions (click)="dialog.close()">Start sprint</qbc-button>
      </qbc-dialog>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A trigger opens the native `<dialog>` with `open()`. Content goes in `[body]`, buttons in `[actions]`.',
      },
    },
  },
};
