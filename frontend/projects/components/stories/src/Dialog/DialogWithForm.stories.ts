import type { StoryObj } from '@storybook/angular';

import type { DialogComponent } from '@qbc/components';

export const WithForm: StoryObj<DialogComponent> = {
  render: () => ({
    template: `
      <qbc-button (click)="dialog.open()">＋ New sprint</qbc-button>
      <qbc-dialog #dialog title="New sprint" subtitle="Give the sprint a name, dates and a delivery goal.">
        <qbc-form-error body>The end date must be after the start date.</qbc-form-error>
        <qbc-form-grid body>
          <qbc-text-input label="Name" [required]="true" [full]="true" value="Sprint 15" />
          <qbc-text-input label="Start date" type="date" value="2026-03-17" />
          <qbc-text-input label="End date" type="date" value="2026-03-13" />
          <qbc-textarea label="Goal" [full]="true" placeholder="What will this sprint deliver?" />
        </qbc-form-grid>
        <qbc-button actions variant="secondary" (click)="dialog.close()">Cancel</qbc-button>
        <qbc-button actions (click)="dialog.close()">Create sprint</qbc-button>
      </qbc-dialog>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A form dialog: `qbc-form-error` and `qbc-form-grid` both project into `[body]`; the body scrolls when it outgrows the viewport.',
      },
    },
  },
};
