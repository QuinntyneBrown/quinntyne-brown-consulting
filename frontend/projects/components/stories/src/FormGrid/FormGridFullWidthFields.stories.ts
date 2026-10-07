import type { StoryObj } from '@storybook/angular';

import type { FormGridComponent } from '@qbc/components';

const sprintOptions = [
  { value: 'sprint-14', label: 'Sprint 14' },
  { value: 'sprint-15', label: 'Sprint 15' },
];

export const FullWidthFields: StoryObj<FormGridComponent> = {
  render: () => ({
    props: { sprintOptions },
    template: `
      <qbc-form-grid>
        <qbc-text-input label="Title" [required]="true" [full]="true" value="Export sprint report as PDF" />
        <qbc-select label="Sprint" value="sprint-14" [options]="sprintOptions" />
        <qbc-text-input label="Story points" type="number" value="5" />
        <qbc-textarea label="Description" [full]="true" placeholder="What should the client see in the report?" />
      </qbc-form-grid>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Controls with `full` span both columns; the rest pair up side by side.',
      },
    },
  },
};
