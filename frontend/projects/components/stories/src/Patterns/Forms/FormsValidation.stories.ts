import type { StoryObj } from '@storybook/angular';

import { epicOptions, ownerOptions, pointOptions } from '../shared/workboard';
import { storyFields, storyForm } from './forms';

export const Validation: StoryObj = {
  name: 'Save failed',
  render: () => ({
    props: { form: storyForm(), epicOptions, ownerOptions, pointOptions },
    template: `
      <form [formGroup]="form" style="max-width: 760px">
        <qbc-form-error
          >Add a title and choose an epic before saving.</qbc-form-error
        >
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
          'When a save is refused, one `qbc-form-error` above the grid says what to fix in plain language. Required fields carry the asterisk from `required` before the user ever submits.',
      },
    },
  },
};
