import type { StoryObj } from '@storybook/angular';

import { epicOptions, ownerOptions, pointOptions } from '../shared/workboard';
import { storyFields, storyForm } from './forms';

export const StoryEditor: StoryObj = {
  name: 'Story editor',
  render: () => ({
    props: {
      form: storyForm({
        title: 'Filter the backlog by priority',
        epicId: 'backlog-grooming',
        description:
          'As a consultant, I want to narrow the backlog to one priority so that I can plan the urgent work first.',
        acceptanceCriteria:
          'The priority filter offers Any, High, Medium and Low.\nThe filter combines with search.',
        points: 3,
      }),
      epicOptions,
      ownerOptions,
      pointOptions,
    },
    template: `
      <form [formGroup]="form" style="max-width: 760px">
        ${storyFields}
        <qbc-action-group style="margin-top: 24px">
          <qbc-button variant="secondary">Cancel</qbc-button>
          <qbc-button type="submit">Save story</qbc-button>
        </qbc-action-group>
      </form>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A reactive `FormGroup` bound through `formControlName`. Title and both textareas are `full`; Epic, Owner and Story points share rows. Grouped epic options render as `<optgroup>`.',
      },
    },
  },
};
