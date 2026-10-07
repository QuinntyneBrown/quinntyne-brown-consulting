/**
 * Shared chrome and sample data for the pattern stories. The shell markup is
 * the app's own (`projects/qbc-workboard/src/app/shell/app-shell.component.html`)
 * with the router outlet replaced by the page under demonstration.
 */
import type { SelectItem } from '@qbc/components';

export interface ShellOptions {
  /** Breadcrumb after "Workspace / ". */
  readonly route: string;
  /** Extra markup for the shell's `[feedback]` live region (a `qbc-toast`). */
  readonly feedback?: string;
}

/**
 * Wraps `page` (a `<qbc-page content>…</qbc-page>`) in the workspace shell.
 * The drawer state is the story prop `navOpen`, so the top-bar menu button
 * toggles it live below 900px.
 */
export function shell(page: string, { route, feedback = '' }: ShellOptions): string {
  return `
    <qbc-app-shell>
      <qbc-sidebar navigation [open]="navOpen">
        <qbc-brand brand (click)="navOpen = false" />
        <qbc-nav-item href="/board" icon="board" label="Board" (activated)="navOpen = false" />
        <qbc-nav-item href="/backlog" icon="backlog" label="Backlog" (activated)="navOpen = false" />
        <qbc-nav-item href="/initiatives" icon="initiatives" label="Initiatives" (activated)="navOpen = false" />
        <qbc-nav-item href="/assistants" icon="assistants" label="Assistants" (activated)="navOpen = false" />
      </qbc-sidebar>
      <qbc-topbar topbar breadcrumb="Workspace / ${route}" [navOpen]="navOpen" (menuToggled)="navOpen = !navOpen">
        <qbc-button>＋ New story</qbc-button>
      </qbc-topbar>
      ${page}
      ${feedback}
    </qbc-app-shell>
  `;
}

export interface BoardStory {
  readonly key: string;
  readonly title: string;
  readonly context: string;
  readonly points: number | null;
  readonly owner: string;
}

export const boardColumns: readonly {
  readonly label: string;
  readonly first: boolean;
  readonly last: boolean;
  readonly stories: readonly BoardStory[];
}[] = [
  {
    label: 'To do',
    first: true,
    last: false,
    stories: [
      {
        key: 'QBC-148',
        title: 'Filter the backlog by priority',
        context: 'Backlog grooming · 0/3 tasks',
        points: 3,
        owner: '',
      },
      {
        key: 'QBC-151',
        title: 'Show assistant hours on the story card',
        context: 'Assistant hours',
        points: 2,
        owner: 'Ada Nwosu',
      },
    ],
  },
  {
    label: 'In progress',
    first: false,
    last: false,
    stories: [
      {
        key: 'QBC-142',
        title: 'Groom a story from the backlog row',
        context: 'Backlog grooming · 2/4 tasks',
        points: 5,
        owner: 'Quinntyne Brown',
      },
    ],
  },
  {
    label: 'Done',
    first: false,
    last: true,
    stories: [
      {
        key: 'QBC-137',
        title: 'Place a ready story into the active sprint',
        context: 'Sprint planning · 3/3 tasks',
        points: 3,
        owner: 'Quinntyne Brown',
      },
      {
        key: 'QBC-139',
        title: 'Complete a sprint and keep its history',
        context: 'Sprint planning',
        points: 8,
        owner: 'Ada Nwosu',
      },
    ],
  },
];

export const sprintOptions: readonly SelectItem[] = [
  { value: '', label: 'No sprint' },
  { value: 'sprint-14', label: 'Sprint 14 · active' },
  { value: 'sprint-15', label: 'Sprint 15 · planned' },
];

export const backlogFilterOptions: readonly SelectItem[] = [
  { value: 'all', label: 'All stories' },
  { value: 'ready', label: 'Ready' },
  { value: 'draft', label: 'Needs grooming' },
  { value: 'archived', label: 'Archived' },
];

export const priorityOptions: readonly SelectItem[] = [
  { value: 'all', label: 'Any priority' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const sortOptions: readonly SelectItem[] = [
  { value: 'priority', label: 'Most urgent first' },
  { value: 'recent', label: 'Recently updated' },
  { value: 'key', label: 'Story key' },
];

export const epicOptions: readonly SelectItem[] = [
  { value: null, label: 'Choose an epic' },
  {
    label: 'Delivery workspace',
    options: [
      { value: 'backlog-grooming', label: 'Backlog grooming' },
      { value: 'sprint-planning', label: 'Sprint planning' },
    ],
  },
  {
    label: 'Assistant operations',
    options: [{ value: 'assistant-hours', label: 'Assistant hours' }],
  },
];

export const ownerOptions: readonly SelectItem[] = [
  { value: null, label: 'Unassigned' },
  { value: 'quinntyne', label: 'Quinntyne Brown' },
  { value: 'ada', label: 'Ada Nwosu' },
];

export const pointOptions: readonly SelectItem[] = [
  { value: null, label: 'Not estimated' },
  ...[1, 2, 3, 5, 8, 13].map((points) => ({ value: points, label: `${points}` })),
];
