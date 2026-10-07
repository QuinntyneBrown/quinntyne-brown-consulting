import type { StoryObj } from '@storybook/angular';

import type { DataRowComponent } from '@qbc/components';

const sprintOptions = [
  { value: '', label: 'No sprint' },
  { value: 'sprint-14', label: 'Sprint 14' },
  { value: 'sprint-15', label: 'Sprint 15' },
];

export const Backlog: StoryObj<DataRowComponent> = {
  render: () => ({
    props: { sprintOptions },
    template: `
      <div>
        <qbc-data-row storyKey="QBC-142" title="Export sprint report as PDF" context="Client reporting / Sprint insights">
          <qbc-status-pill state tone="ready" label="Ready" />
          <qbc-tag state>High</qbc-tag>
          <qbc-points estimate [value]="5" />
          <span owner>Quinntyne Brown</span>
          <qbc-select sprint size="sm" ariaLabel="Sprint assignment for QBC-142" [labelHidden]="true" value="sprint-14" [options]="sprintOptions" />
          <qbc-button actions variant="quiet" size="sm">Mark unready</qbc-button>
          <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
        </qbc-data-row>
        <qbc-data-row storyKey="QBC-151" title="Invite assistants by email" context="Team setup / Assistant onboarding">
          <qbc-status-pill state tone="draft" label="Draft" />
          <qbc-points estimate [value]="3" />
          <span owner>Ada Lovelace</span>
          <qbc-select sprint size="sm" ariaLabel="Sprint assignment for QBC-151" [labelHidden]="true" value="" [options]="sprintOptions" [disabled]="true" />
          <qbc-button actions variant="quiet" size="sm">Groom</qbc-button>
          <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
        </qbc-data-row>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Stacked as the backlog list. Unready stories keep the sprint select disabled until groomed.',
      },
    },
  },
};
