import type { StoryObj } from '@storybook/angular';

import type { FormErrorComponent } from '@qbc/components';

export const AboveForm: StoryObj<FormErrorComponent> = {
  render: () => ({
    template: `
      <div style="max-width: 640px">
        <qbc-form-error>Story points must be a whole number.</qbc-form-error>
        <qbc-form-grid>
          <qbc-text-input label="Title" [full]="true" value="Export sprint report as PDF" />
          <qbc-text-input label="Story points" type="number" value="2.5" />
          <qbc-text-input label="Owner" value="Quinntyne Brown" />
        </qbc-form-grid>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Placed above the fields it refers to; its bottom margin separates it from the form.',
      },
    },
  },
};
