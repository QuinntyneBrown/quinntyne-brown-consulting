import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  ButtonComponent,
  CheckboxComponent,
  SelectComponent,
  TaskItemComponent,
  TextInputComponent,
} from '@qbc/components';

import descriptionMd from './TaskItemDescription.md';
import bestPracticesMd from './TaskItemBestPractices.md';

export { Default } from './TaskItemDefault.stories';
export { TaskList } from './TaskItemTaskList.stories';

export default {
  title: 'Components/TaskItem',
  component: TaskItemComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TaskItemComponent,
        ButtonComponent,
        CheckboxComponent,
        SelectComponent,
        TextInputComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TaskItemComponent>;
