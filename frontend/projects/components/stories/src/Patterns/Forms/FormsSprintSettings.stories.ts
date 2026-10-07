import type { StoryObj } from '@storybook/angular';

export const SprintSettings: StoryObj = {
  name: 'Sprint settings',
  render: () => ({
    template: `
      <form style="max-width: 760px" (submit)="$event.preventDefault()">
        <qbc-form-grid>
          <qbc-text-input label="Sprint name" required value="Sprint 15" />
          <qbc-text-input label="Start date" type="date" value="2026-10-12" hint="Sprints run for 14 days." />
          <qbc-textarea
            label="Sprint goal"
            full
            value="Record assistant hours against stories and read them back by person."
          />
          <qbc-field label="Definition of ready" hint="Stories need all three before they can join the sprint." full>
            <div style="display: grid; gap: 8px">
              <qbc-checkbox label="Acceptance criteria written" [value]="true" />
              <qbc-checkbox label="Estimated in story points" [value]="true" />
              <qbc-checkbox label="Linked to an epic" />
            </div>
          </qbc-field>
        </qbc-form-grid>
        <qbc-action-group align="between" style="margin-top: 24px">
          <qbc-button variant="danger">Delete sprint</qbc-button>
          <div style="display: flex; gap: 9px">
            <qbc-button variant="secondary">Cancel</qbc-button>
            <qbc-button type="submit">Save sprint</qbc-button>
          </div>
        </qbc-action-group>
      </form>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Without a reactive form, bind the one-way `value` input (and listen to `valueChange`). `qbc-field` labels the checkbox group, and `align="between"` separates the destructive action from Cancel / Save.',
      },
    },
  },
};
