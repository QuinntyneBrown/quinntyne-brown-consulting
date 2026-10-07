import type { StoryObj } from '@storybook/angular';

import type { EpicRowComponent } from '@qbc/components';

export const List: StoryObj<EpicRowComponent> = {
  render: () => ({
    template: `
      <div>
        <qbc-epic-row title="Sprint insights" summary="Velocity, burndown and exportable client reports." [storyCount]="8" [progress]="62">
          <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
        </qbc-epic-row>
        <qbc-epic-row title="Assistant onboarding" summary="Invite, permission and introduce new assistants." [storyCount]="5" [progress]="20">
          <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
        </qbc-epic-row>
        <qbc-epic-row title="Backlog grooming" summary="Ready checks and story point estimates." [storyCount]="11" [progress]="91">
          <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
        </qbc-epic-row>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: { story: 'Epics listed under an initiative, separated by a top rule.' },
    },
  },
};
