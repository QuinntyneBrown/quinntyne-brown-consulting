import type { StoryObj } from '@storybook/angular';

import { shell } from '../shared/workboard';

export const Feedback: StoryObj = {
  name: 'With feedback toast',
  render: () => ({
    props: { navOpen: false },
    template: shell(
      `
      <qbc-page content>
        <qbc-page-header
          title="Initiatives"
          description="Connect strategic outcomes to the epics and stories that make them real."
          ><qbc-button actions>＋ New initiative</qbc-button></qbc-page-header
        >
        <qbc-loading-state>Loading initiatives…</qbc-loading-state>
      </qbc-page>
    `,
      {
        route: 'Initiatives',
        feedback: `<qbc-toast feedback>Story QBC-142 saved.</qbc-toast>`,
      },
    ),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'Project a `qbc-toast` into `[feedback]` to confirm an action. The slot is a polite live region, so the message is announced without moving focus; use `tone="error"` for failures.',
      },
    },
  },
};
