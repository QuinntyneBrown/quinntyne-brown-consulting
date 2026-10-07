import type { StoryObj } from '@storybook/angular';

import type { TaskItemComponent } from '@qbc/components';

export const TaskList: StoryObj<TaskItemComponent> = {
  render: () => ({
    props: {
      assistants: [
        { value: 'amara', label: 'Amara Okafor' },
        { value: 'quinn', label: 'Quinntyne Brown' },
      ],
    },
    template: `
      <div style="display: grid; gap: 8px">
        <qbc-task-item [done]="true">
          <qbc-checkbox [value]="true" ariaLabel="Complete task 1" />
          <qbc-text-input size="sm" labelHidden ariaLabel="Task 1 title" value="Parse uploaded CSV" />
          <qbc-select size="sm" labelHidden ariaLabel="Task 1 assignee" [options]="assistants" value="quinn" />
          <qbc-button variant="quiet" size="sm" ariaLabel="Remove task 1">Remove</qbc-button>
        </qbc-task-item>
        <qbc-task-item [done]="false">
          <qbc-checkbox [value]="false" ariaLabel="Complete task 2" />
          <qbc-text-input size="sm" labelHidden ariaLabel="Task 2 title" value="Write CSV column mapping" />
          <qbc-select size="sm" labelHidden ariaLabel="Task 2 assignee" [options]="assistants" value="amara" />
          <qbc-button variant="quiet" size="sm" ariaLabel="Remove task 2">Remove</qbc-button>
        </qbc-task-item>
        <qbc-task-item [done]="false">
          <qbc-checkbox [value]="false" ariaLabel="Complete task 3" />
          <qbc-text-input size="sm" labelHidden ariaLabel="Task 3 title" value="Show import errors per row" />
          <qbc-select size="sm" labelHidden ariaLabel="Task 3 assignee" [options]="assistants" value="quinn" />
          <qbc-button variant="quiet" size="sm" ariaLabel="Remove task 3">Remove</qbc-button>
        </qbc-task-item>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: { story: "A story's task list: completed tasks set `done` and are dimmed." },
    },
  },
};
