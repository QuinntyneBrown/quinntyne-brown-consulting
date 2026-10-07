import type { StoryObj } from '@storybook/angular';

import { backlogFilterOptions, priorityOptions, shell, sortOptions } from '../shared/workboard';
import { backlogStyles, toolbar } from './backlog';

export const NoMatches: StoryObj = {
  name: 'No matches',
  render: () => ({
    props: {
      navOpen: false,
      search: 'invoice',
      filterOptions: backlogFilterOptions,
      priorityOptions,
      sortOptions,
    },
    styles: backlogStyles,
    template: shell(
      `
      <qbc-page content>
        <qbc-page-header
          title="Backlog"
          description="Shape ideas into ready work, then place them into a two-week sprint."
        />
        ${toolbar}
        <qbc-empty-state
          title="No matching stories"
          description="Try another filter or create a new story."
          ><qbc-button actions>New story</qbc-button></qbc-empty-state
        >
      </qbc-page>
    `,
      { route: 'Backlog' },
    ),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'A search with no results keeps the toolbar so the filter can be changed, and replaces the list with an empty state.',
      },
    },
  },
};
