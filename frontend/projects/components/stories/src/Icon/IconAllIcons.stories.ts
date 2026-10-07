import type { StoryObj } from '@storybook/angular';

import type { IconComponent, IconName } from '@qbc/components';

const names: readonly IconName[] = [
  'board',
  'backlog',
  'initiatives',
  'assistants',
  'menu',
  'add',
  'close',
  'search',
  'arrow-left',
  'arrow-right',
  'more',
  'alert',
  'empty',
  'initiative',
  'upload',
  'download',
  'trash',
  'retry',
  'pending',
];

export const AllIcons: StoryObj<IconComponent> = {
  render: () => ({
    props: { names },
    template: `
      <ul style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none">
        @for (name of names; track name) {
          <li style="display: grid; gap: 8px; justify-items: center; padding: 16px 8px; border: 1px solid var(--qbc-line); border-radius: 12px">
            <qbc-icon [name]="name" [size]="22" />
            <code style="font-size: 12px">{{ name }}</code>
          </li>
        }
      </ul>
    `,
  }),
  parameters: {
    docs: {
      description: { story: 'Every `IconName`, labelled with the name to pass.' },
    },
  },
};
