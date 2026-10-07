import type { StoryObj } from '@storybook/angular';

import { shell } from '../shared/workboard';
import { backlogStyles } from './backlog';

export const Initiatives: StoryObj = {
  render: () => ({
    props: { navOpen: false },
    styles: backlogStyles,
    template: shell(
      `
      <qbc-page content>
        <qbc-page-header
          title="Initiatives"
          description="Connect strategic outcomes to the epics and stories that make them real."
          ><qbc-button actions>＋ New initiative</qbc-button></qbc-page-header
        >
        <div class="hierarchy-list">
          <qbc-initiative-card
            title="Delivery workspace"
            description="One place to groom, plan and run two-week sprints for consulting work."
            summary="3 epics · 14 stories · 57% complete"
          >
            <qbc-button actions variant="quiet" size="sm">＋ Epic</qbc-button>
            <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
            <qbc-button actions variant="danger" size="sm">Delete</qbc-button>
            <qbc-epic-row
              title="Backlog grooming"
              summary="Estimate, prioritise and mark stories ready from the backlog."
              [storyCount]="6"
              [progress]="67"
            >
              <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
              <qbc-button actions variant="danger" size="sm">Delete</qbc-button>
            </qbc-epic-row>
            <qbc-epic-row
              title="Sprint planning"
              summary="Place ready work into a sprint and complete it with history intact."
              [storyCount]="7"
              [progress]="57"
            >
              <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
              <qbc-button actions variant="danger" size="sm">Delete</qbc-button>
            </qbc-epic-row>
            <qbc-epic-row title="Attachments" summary="Files on initiatives, epics and stories." [storyCount]="1" [progress]="0">
              <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
              <qbc-button actions variant="danger" size="sm">Delete</qbc-button>
            </qbc-epic-row>
          </qbc-initiative-card>
          <qbc-initiative-card
            title="Assistant operations"
            description="Know who is working on what, and how many hours went into it."
            summary="0 epics · 0 stories"
          >
            <qbc-button actions variant="quiet" size="sm">＋ Epic</qbc-button>
            <qbc-button actions variant="quiet" size="sm">Edit</qbc-button>
            <qbc-button actions variant="danger" size="sm">Delete</qbc-button>
            <p class="empty-copy">No epics yet. Add one in the context of this initiative.</p>
          </qbc-initiative-card>
        </div>
      </qbc-page>
    `,
      { route: 'Initiatives' },
    ),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'Initiatives own epics; each epic row rolls up its stories into a count and a mini progress bar. An initiative without epics says so in plain copy rather than a second empty-state card.',
      },
    },
  },
};
