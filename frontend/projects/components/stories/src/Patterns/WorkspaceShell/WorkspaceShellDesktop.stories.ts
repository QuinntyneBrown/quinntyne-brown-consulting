import type { StoryObj } from '@storybook/angular';

import { shell } from '../shared/workboard';

export const Desktop: StoryObj = {
  render: () => ({
    props: { navOpen: false },
    template: shell(
      `
      <qbc-page content>
        <qbc-page-header
          title="Assistants"
          description="The people and agents who pick up stories, and the hours they have spent on them."
          ><qbc-button actions variant="secondary">Log hours</qbc-button></qbc-page-header
        >
        <qbc-empty-state
          title="No assistants yet"
          description="Add an assistant so stories and tasks can be assigned."
          ><qbc-button actions>Add assistant</qbc-button></qbc-empty-state
        >
      </qbc-page>
    `,
      { route: 'Assistants' },
    ),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'Above 900px the sidebar is fixed and the workspace is offset by `--qbc-sidebar-w`; the top bar shows the breadcrumb and the global action.',
      },
    },
  },
};
