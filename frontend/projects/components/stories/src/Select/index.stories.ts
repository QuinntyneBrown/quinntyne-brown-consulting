import { ReactiveFormsModule } from '@angular/forms';
import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { SelectComponent } from '@qbc/components';

import descriptionMd from './SelectDescription.md';
import bestPracticesMd from './SelectBestPractices.md';

export { Default } from './SelectDefault.stories';
export { Groups } from './SelectGroups.stories';
export { Compact } from './SelectCompact.stories';
export { Disabled } from './SelectDisabled.stories';

export default {
  title: 'Components/Select',
  component: SelectComponent,
  decorators: [moduleMetadata({ imports: [SelectComponent, ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<SelectComponent>;
