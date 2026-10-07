import type { StoryObj } from '@storybook/angular';

import type { ConfirmDialogComponent } from '@qbc/components';

export const DeleteSprint: StoryObj<ConfirmDialogComponent> = {
  render: () => ({
    template: `
      <qbc-button
        variant="secondary"
        (click)="confirm.open('Delete Sprint 14?', 'Its 9 stories return to the backlog with their story points intact.', 'Delete sprint')"
      >Delete sprint</qbc-button>
      <qbc-confirm-dialog #confirm />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Say what happens to the work that depends on the item being removed.',
      },
    },
  },
};
