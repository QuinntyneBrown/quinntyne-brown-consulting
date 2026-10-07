import type { StoryObj } from '@storybook/angular';

import {
  backlogFilterOptions,
  priorityOptions,
  shell,
  sortOptions,
  sprintOptions,
} from '../shared/workboard';
import { backlogStories, backlogStyles, toolbar } from './backlog';

export const StoryList: StoryObj = {
  name: 'Story list',
  render: () => ({
    props: {
      navOpen: false,
      search: '',
      stories: backlogStories,
      filterOptions: backlogFilterOptions,
      priorityOptions,
      sortOptions,
      sprintOptions,
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
        <div class="data-list">
          @for (story of stories; track story.key) {
            <qbc-data-row [storyKey]="story.key" [title]="story.title" [context]="story.context">
              <qbc-status-pill state [tone]="story.tone" [label]="story.tone" />
              @if (story.priority) {
                <qbc-tag state>{{ story.priority }}</qbc-tag>
              }
              <qbc-points estimate [value]="story.points" />
              <span owner>{{ story.owner ?? 'Unassigned' }}</span>
              <qbc-select
                sprint
                size="sm"
                ariaLabel="Sprint assignment"
                labelHidden
                [value]="story.sprint"
                [options]="sprintOptions"
                [disabled]="story.tone !== 'ready'"
              />
              @if (story.tone === 'draft') {
                <qbc-button actions variant="quiet" size="sm">Groom</qbc-button>
              }
              @if (story.tone === 'ready') {
                <qbc-button actions variant="quiet" size="sm">Mark unready</qbc-button>
              }
              <qbc-button actions variant="quiet" size="sm">Open</qbc-button>
            </qbc-data-row>
          }
        </div>
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
          'Ready stories can be placed in a sprint from the row; drafts must be groomed first, so their sprint select is disabled and the row offers *Groom* instead.',
      },
    },
  },
};
