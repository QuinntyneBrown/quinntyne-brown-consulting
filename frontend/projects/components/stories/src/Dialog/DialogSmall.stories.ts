import type { StoryObj } from '@storybook/angular';

import type { DialogComponent } from '@qbc/components';

export const Small: StoryObj<DialogComponent> = {
  render: () => ({
    template: `
      <qbc-button variant="secondary" (click)="dialog.open()">Move story</qbc-button>
      <qbc-dialog #dialog size="sm" title="Move to Sprint 15?" subtitle="QBC-142 · 5 story points">
        <p body style="margin: 0">The story leaves Sprint 14 and keeps its estimate.</p>
        <qbc-button actions variant="secondary" (click)="dialog.close()">Cancel</qbc-button>
        <qbc-button actions (click)="dialog.close()">Move story</qbc-button>
      </qbc-dialog>
    `,
  }),
  parameters: {
    docs: {
      description: { story: '`size="sm"` narrows the sheet to 430px for short decisions.' },
    },
  },
};
