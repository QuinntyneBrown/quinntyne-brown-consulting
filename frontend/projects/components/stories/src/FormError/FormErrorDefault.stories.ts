import type { StoryObj } from '@storybook/angular';

import type { FormErrorComponent } from '@qbc/components';

export const Default: StoryObj<FormErrorComponent & { message: string }> = {
  args: {
    message: 'The sprint could not be saved. Check your connection and try again.',
  },
  render: (args) => ({
    props: args,
    template: `<qbc-form-error>{{ message }}</qbc-form-error>`,
  }),
};
