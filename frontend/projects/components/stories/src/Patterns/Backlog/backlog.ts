/**
 * Layout for the backlog stories, mirroring `backlog-page.component.scss` and
 * `hierarchy-page.component.scss` in the app.
 */
export const backlogStyles = [
  `
  .toolbar {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    margin-bottom: 22px;
  }
  .toolbar .search {
    flex: 1;
    max-width: 430px;
  }
  .toolbar qbc-select {
    min-width: 150px;
  }
  .data-list {
    overflow: hidden;
    border: 1px solid var(--qbc-line);
    border-radius: var(--qbc-r-xl);
  }
  .hierarchy-list {
    display: grid;
    gap: 18px;
  }
  .empty-copy {
    color: var(--qbc-ink-soft);
  }
  @media (max-width: 760px) {
    .toolbar {
      align-items: stretch;
      flex-direction: column;
    }
    .toolbar .search,
    .toolbar qbc-select {
      width: 100%;
      max-width: none;
    }
    .data-list {
      overflow: visible;
      border: 0;
    }
  }
  `,
];

export const toolbar = `
  <div class="toolbar">
    <qbc-text-input
      class="search"
      icon="search"
      label="Search backlog"
      labelHidden
      placeholder="Search stories or epics"
      [value]="search"
    />
    <qbc-select ariaLabel="Filter backlog" labelHidden value="all" [options]="filterOptions" />
    <qbc-select ariaLabel="Filter by priority" labelHidden value="all" [options]="priorityOptions" />
    <qbc-select ariaLabel="Order backlog" labelHidden value="priority" [options]="sortOptions" />
  </div>
`;

export interface BacklogStory {
  readonly key: string;
  readonly title: string;
  readonly context: string;
  readonly tone: 'ready' | 'draft' | 'archived';
  readonly priority: string;
  readonly points: number | null;
  readonly owner: string | null;
  readonly sprint: string;
}

export const backlogStories: readonly BacklogStory[] = [
  {
    key: 'QBC-148',
    title: 'Filter the backlog by priority',
    context: 'Delivery workspace / Backlog grooming',
    tone: 'ready',
    priority: 'High',
    points: 3,
    owner: null,
    sprint: 'sprint-14',
  },
  {
    key: 'QBC-153',
    title: 'Attach a design file to an epic',
    context: 'Delivery workspace / Attachments',
    tone: 'ready',
    priority: '',
    points: 5,
    owner: 'Ada Nwosu',
    sprint: '',
  },
  {
    key: 'QBC-156',
    title: 'Read an assistant’s hours by story',
    context: 'Assistant operations / Assistant hours',
    tone: 'draft',
    priority: 'Medium',
    points: null,
    owner: 'Quinntyne Brown',
    sprint: '',
  },
  {
    key: 'QBC-121',
    title: 'Export the backlog as CSV',
    context: 'Delivery workspace / Backlog grooming',
    tone: 'archived',
    priority: '',
    points: 2,
    owner: null,
    sprint: '',
  },
];
