import type { StoryObj } from '@storybook/angular';

import type { DataRowComponent } from '@qbc/components';

const sprintOptions = [
  { value: '', label: 'No sprint' },
  { value: 'sprint-14', label: 'Sprint 14' },
  { value: 'sprint-15', label: 'Sprint 15' },
];

export const Default: StoryObj<DataRowComponent> = {
  args: {
    storyKey: 'QBC-142',
    title: 'Export sprint report as PDF',
    context: 'Client reporting / Sprint insights',
  },
  render: (args) => ({
    props: { ...args, sprintOptions },
    template: `
      <qbc-data-row [storyKey]="storyKey" [title]="title" [context]="context">
        <qbc-status-pill state tone="ready" label="Ready" />
        <qbc-points estimate [value]="5" />
        <span owner>Quinntyne Brown</span>
        <qbc-select
          sprint
          size="sm"
          ariaLabel="Sprint assignment"
          [labelHidden]="true"
          value="sprint-14"
          [options]="sprintOptions"
        />
        <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
      </qbc-data-row>
    `,
  }),
};
