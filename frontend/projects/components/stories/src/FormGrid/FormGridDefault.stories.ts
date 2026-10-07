import type { StoryObj } from '@storybook/angular';

import type { FormGridComponent } from '@qbc/components';

export const Default: StoryObj<FormGridComponent> = {
  render: () => ({
    template: `
      <qbc-form-grid>
        <qbc-text-input label="Story key" value="QBC-142" [readonly]="true" />
        <qbc-text-input label="Story points" type="number" value="5" />
        <qbc-text-input label="Owner" value="Quinntyne Brown" />
        <qbc-text-input label="Epic" value="Sprint insights" />
      </qbc-form-grid>
    `,
  }),
};
