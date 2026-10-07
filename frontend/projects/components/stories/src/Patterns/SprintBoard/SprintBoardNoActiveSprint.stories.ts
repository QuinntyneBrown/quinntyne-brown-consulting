import type { StoryObj } from '@storybook/angular';

import { shell } from '../shared/workboard';

export const NoActiveSprint: StoryObj = {
  name: 'No active sprint',
  render: () => ({
    props: { navOpen: false },
    template: shell(
      `
      <qbc-page content>
        <qbc-page-header title="Sprint board" description="A quiet view of the team’s current commitment."
          ><qbc-button actions variant="secondary">Manage sprints</qbc-button></qbc-page-header
        >
        <qbc-empty-state
          title="No active sprint"
          description="Start a planned sprint to bring Ready stories onto the board."
          ><qbc-button actions>Choose a sprint</qbc-button></qbc-empty-state
        >
      </qbc-page>
    `,
      { route: 'Board' },
    ),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'Between sprints the board has nothing to show; the empty state explains why and offers the one next step.',
      },
    },
  },
};
