import type { StoryObj } from '@storybook/angular';

import { StoryList } from './BacklogStoryList.stories';

export const Mobile: StoryObj = {
  ...StoryList,
  name: 'Mobile',
  globals: { viewport: { value: 'mobile' } },
  parameters: {
    docs: {
      description: {
        story:
          'Below 760px the toolbar stacks full width and each data row becomes its own bordered card with labelled cells.',
      },
    },
  },
};
