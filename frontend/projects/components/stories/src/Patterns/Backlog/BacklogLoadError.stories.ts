import type { StoryObj } from '@storybook/angular';

import { backlogFilterOptions, priorityOptions, shell, sortOptions } from '../shared/workboard';
import { backlogStyles, toolbar } from './backlog';

export const LoadError: StoryObj = {
  name: 'Loading and error',
  render: () => ({
    props: {
      navOpen: false,
      search: '',
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
        <qbc-form-error>The backlog could not be refreshed. Check your connection and try again.</qbc-form-error>
        <qbc-loading-state>Loading backlog…</qbc-loading-state>
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
          '`qbc-form-error` (an alert) sits above the content it refers to; `qbc-loading-state` (a status) holds the place of the list on first load.',
      },
    },
  },
};
