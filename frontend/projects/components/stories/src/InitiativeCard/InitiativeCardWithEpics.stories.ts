import type { StoryObj } from '@storybook/angular';

import type { InitiativeCardComponent } from '@qbc/components';

export const WithEpics: StoryObj<InitiativeCardComponent> = {
  render: () => ({
    template: `
      <qbc-initiative-card
        title="Assistant automation"
        description="Hand repetitive backlog grooming to workboard assistants."
        summary="2 epics · 11 stories · 34 story points"
      >
        <qbc-button actions size="sm">Add epic</qbc-button>
        <ul style="display: grid; gap: 14px; margin: 14px 0 0; padding: 0; list-style: none">
          <li style="display: flex; gap: 12px; align-items: center; justify-content: space-between">
            <strong>Auto-estimate new stories</strong>
            <span style="display: flex; gap: 10px; align-items: center">
              <qbc-pill tone="inProgress" label="In progress" />
              <qbc-progress [value]="60" [mini]="true" label="Auto-estimate new stories progress" />
              <qbc-points [value]="21" />
            </span>
          </li>
          <li style="display: flex; gap: 12px; align-items: center; justify-content: space-between">
            <strong>Backlog triage digest</strong>
            <span style="display: flex; gap: 10px; align-items: center">
              <qbc-pill tone="planned" label="Planned" />
              <qbc-progress [value]="0" [mini]="true" label="Backlog triage digest progress" />
              <qbc-points [value]="13" />
            </span>
          </li>
        </ul>
      </qbc-initiative-card>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'The default slot holds the initiative’s epics, indented under the title.',
      },
    },
  },
};
