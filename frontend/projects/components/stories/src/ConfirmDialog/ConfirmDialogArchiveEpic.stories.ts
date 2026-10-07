import type { StoryObj } from '@storybook/angular';

import type { ConfirmDialogComponent } from '@qbc/components';

export const ArchiveEpic: StoryObj<ConfirmDialogComponent> = {
  render: () => ({
    template: `
      <qbc-button
        variant="quiet"
        (click)="confirm.open('Archive this epic?', 'Onboarding redesign and its 12 stories leave the initiative view.')"
      >Archive epic</qbc-button>
      <qbc-confirm-dialog #confirm />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Without a third argument the confirm button reads "Confirm".',
      },
    },
  },
};
