import type { StoryObj } from '@storybook/angular';

import type { DataRowComponent } from '@qbc/components';

const sprintOptions = [
  { value: '', label: 'No sprint' },
  { value: 'sprint-14', label: 'Sprint 14' },
  { value: 'sprint-15', label: 'Sprint 15' },
];

export const Unassigned: StoryObj<DataRowComponent> = {
  render: () => ({
    props: { sprintOptions },
    template: `
      <qbc-data-row storyKey="QBC-163" title="Archive completed initiatives" context="Workboard hygiene / Initiative lifecycle">
        <qbc-status-pill state tone="todo" label="To do" />
        <qbc-points estimate />
        <span owner>Unassigned</span>
        <qbc-select sprint size="sm" ariaLabel="Sprint assignment" [labelHidden]="true" value="" [options]="sprintOptions" />
        <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
      </qbc-data-row>
    `,
  }),
  parameters: {
    docs: {
      description: { story: 'No owner and no estimate yet.' },
    },
  },
};
