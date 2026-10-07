import type { StoryObj } from '@storybook/angular';

import type { TaskItemComponent } from '@qbc/components';

export const Default: StoryObj<TaskItemComponent> = {
  args: {
    done: false,
  },
  render: (args) => ({
    props: {
      ...args,
      assistants: [
        { value: 'amara', label: 'Amara Okafor' },
        { value: 'quinn', label: 'Quinntyne Brown' },
      ],
    },
    template: `
      <qbc-task-item [done]="done">
        <qbc-checkbox [value]="done" ariaLabel="Complete task 1" />
        <qbc-text-input size="sm" labelHidden ariaLabel="Task 1 title" value="Write CSV column mapping" />
        <qbc-select size="sm" labelHidden ariaLabel="Task 1 assignee" [options]="assistants" value="amara" />
        <qbc-button variant="quiet" size="sm" ariaLabel="Remove task 1">Remove</qbc-button>
      </qbc-task-item>
    `,
  }),
};
