import type { Sprint, Story } from '@qbc/api';
import type { WorkboardApiState } from './workboard-api-state';

/**
 * A named precondition a specification declares with `test.use({ seed })`. Each one describes the
 * workspace a Given clause assumes, so scenario intent stays readable and no test depends on
 * another test's changes.
 */
export interface WorkspaceScenario {
  /** How the Given clause reads, used as the enclosing describe title. */
  readonly name: string;
  readonly apply: (state: WorkboardApiState) => void;
}

/**
 * The markdown outcome brief the editor is built for. It carries a heading of every level the
 * outline shows, emphasis, a nested list, a task list, a table, and a fenced code block, so one
 * scenario can exercise rendering, the outline, and the size report.
 */
export const MARKDOWN_BRIEF = [
  '# Zero-friction sprint planning',
  '',
  'Planning a two-week sprint should take one focused conversation, not an',
  'afternoon of **spreadsheet archaeology**.',
  '',
  '## Outcome',
  '',
  'A delivery lead commits a two-week sprint in under ten minutes.',
  '',
  '## Success signals',
  '',
  '| Signal | Baseline | Target |',
  '| --- | --- | --- |',
  '| Time to commit a sprint | 46 min | under 10 min |',
  '',
  '## Guardrails',
  '',
  '- Keep the workspace usable on a phone',
  '  - Committing a sprint stays a desktop action',
  '- No new third-party services',
  '',
  '## Epics',
  '',
  '- [x] Groom the backlog into a ready queue',
  '- [ ] Roll sprint scope up to the initiative',
  '',
  '```sql',
  'SELECT i.Id, COUNT(s.Id) AS StoryCount FROM Initiatives i GROUP BY i.Id;',
  '```',
].join('\n');

/** The first initiative carries a full markdown outcome brief. */
export const initiativeWithMarkdownBrief: WorkspaceScenario = {
  name: 'an initiative whose brief is written in markdown',
  apply: (state) => {
    state.initiatives[0] = { ...state.initiatives[0], description: MARKDOWN_BRIEF };
  },
};

/** The seeded workspace, unchanged. */
export const seededWorkspace: WorkspaceScenario = {
  name: 'the seeded workspace',
  apply: () => undefined,
};

/** No story matches any backlog filter, so the backlog renders its empty state. */
export const emptyBacklog: WorkspaceScenario = {
  name: 'a workspace with no stories',
  apply: (state) => {
    state.stories.length = 0;
  },
};

/** Nothing has been created yet, so every view renders its empty state. */
export const emptyWorkspace: WorkspaceScenario = {
  name: 'a workspace with nothing in it',
  apply: (state) => {
    state.stories.length = 0;
    state.epics.length = 0;
    state.initiatives.length = 0;
    state.sprints.length = 0;
    state.assistants.length = 0;
  },
};

/** No sprint is active, and one planned sprint is waiting to be started. */
export const noActiveSprint: WorkspaceScenario = {
  name: 'a workspace with nothing running',
  apply: (state) => {
    for (const story of state.stories) unassignSprint(state, story);
    keepSprints(state, () => false);
    state.sprints.push({
      id: '40000000-0000-4000-8000-000000000020',
      name: 'Sprint 20',
      goal: 'Prepare the next delivery increment.',
      startDate: '2026-09-14',
      endDate: '2026-09-27',
      status: 'planned',
      storyCount: 0,
      storyKeys: [],
    });
  },
};

/** Only the completed sprint remains, so nothing can start without planning one first. */
export const onlyCompletedSprint: WorkspaceScenario = {
  name: 'a workspace between sprints',
  apply: (state) => {
    for (const story of state.stories) {
      if (story.sprintId !== null && sprintStatus(state, story) !== 'completed')
        unassignSprint(state, story);
    }
    keepSprints(state, (sprint) => sprint.status === 'completed');
  },
};

/** The active sprint holds work in To do and In progress only, leaving Done empty. */
export const activeSprintWithoutDoneWork: WorkspaceScenario = {
  name: 'an active sprint with nothing finished',
  apply: (state) => {
    for (const story of state.stories) {
      if (sprintStatus(state, story) === 'active' && story.boardStatus === 'done')
        replaceStory(state, { ...story, boardStatus: 'toDo' });
    }
  },
};

/** An initiative that owns no epics, so it may be deleted. */
export const initiativeWithoutEpics: WorkspaceScenario = {
  name: 'an initiative with nothing beneath it',
  apply: (state) => {
    state.initiatives.push({
      id: '20000000-0000-4000-8000-000000000009',
      name: 'Retired advisory practice',
      description: 'An outcome the practice no longer pursues.',
    });
  },
};

/** An epic that owns no stories, so it may be deleted. */
/** An epic summary carrying the blocks a writer actually uses, for the epic editor's round trip. */
export const MARKDOWN_SUMMARY = [
  '# Client delivery portal',
  '',
  'Give clients a **calm, shared view** of where their engagement stands.',
  '',
  '## Scope',
  '',
  '- Outcomes, decisions, and milestones on one page',
  '  - Decisions carry the date they were taken',
  '',
  '## Out of scope',
  '',
  '- [ ] Invoicing',
].join('\n');

export const epicWithMarkdownSummary: WorkspaceScenario = {
  name: 'an epic whose summary is markdown',
  apply: (state) => {
    state.epics[0] = { ...state.epics[0], summary: MARKDOWN_SUMMARY };
  },
};

export const epicWithoutStories: WorkspaceScenario = {
  name: 'an epic with nothing beneath it',
  apply: (state) => {
    state.epics.push({
      id: '30000000-0000-4000-8000-000000000009',
      initiativeId: '20000000-0000-4000-8000-000000000001',
      name: 'Retired onboarding kit',
      summary: 'A capability the practice no longer builds.',
    });
  },
};

/** An assistant nobody is relying on, so the directory allows deletion. */
/**
 * An initiative holding exactly one epic and exactly one story. Every other roll-up scenario counts
 * two or more, which is how a plural that reads "1 epics" reached production unnoticed.
 */
export const initiativeCountingOne: WorkspaceScenario = {
  name: 'an initiative with a single epic and a single story',
  apply: (state) => {
    const initiativeId = '20000000-0000-4000-8000-00000000000a';
    const epicId = '30000000-0000-4000-8000-00000000000a';
    state.initiatives.push({
      id: initiativeId,
      name: 'Single-count outcome',
      description: 'An outcome holding one of everything.',
    });
    state.epics.push({
      id: epicId,
      initiativeId,
      name: 'Single-count capability',
      summary: 'A capability holding one story.',
    });
    state.stories.push({
      ...state.stories[0],
      id: '50000000-0000-4000-8000-00000000010a',
      key: 'QBC-201',
      epicId,
      epicName: 'Single-count capability',
      initiativeName: 'Single-count outcome',
      title: 'The only story beneath the only epic',
      sprintId: null,
      sprintName: null,
      sprintStatus: null,
      boardStatus: 'todo',
      tasks: [],
    });
  },
};

export const unassignedAssistant: WorkspaceScenario = {
  name: 'an assistant nobody is relying on',
  apply: (state) => {
    state.assistants.push({
      id: '10000000-0000-4000-8000-000000000009',
      fullName: 'Priya Raman',
      role: 'Research assistant',
      specialties: ['Discovery'],
      availability: 'limited',
      storyCount: 0,
      incompleteTaskCount: 0,
      blockingAssignments: [],
    });
  },
};

/**
 * An assistant who owns no story and holds no task, and whose only claim on the workspace is the
 * hours they logged against somebody else's story.
 */
export const assistantWithOnlyLoggedHours: WorkspaceScenario = {
  name: 'an assistant whose only work is the hours they logged',
  apply: (state) => {
    const priyaId = '10000000-0000-4000-8000-000000000009';
    state.assistants.push({
      id: priyaId,
      fullName: 'Priya Raman',
      role: 'Research assistant',
      specialties: ['Discovery'],
      availability: 'limited',
      storyCount: 0,
      incompleteTaskCount: 0,
      blockingAssignments: [],
    });
    state.timeEntries.push({
      id: '70000000-0000-4000-8000-000000000009',
      storyId: '50000000-0000-4000-8000-000000000103',
      storyKey: 'QBC-103',
      assistantId: priyaId,
      assistantName: 'Priya Raman',
      workedOn: '2026-08-27',
      hours: 1.5,
      note: 'Compared grounding approaches',
    });
  },
};

/** A Ready story sitting outside any sprint, so its readiness can be withdrawn. */
export const readyUnscheduledStory: WorkspaceScenario = {
  name: 'a Ready story outside any sprint',
  apply: (state) => {
    const story = byKey(state, 'QBC-105');
    replaceStory(state, { ...story, lifecycle: 'active', isReady: true, sprintId: null });
  },
};

/** A Draft story that already carries every grooming field, so grooming succeeds. */
export const groomableDraftStory: WorkspaceScenario = {
  name: 'a draft that satisfies the grooming rules',
  apply: (state) => {
    const story = byKey(state, 'QBC-106');
    replaceStory(state, {
      ...story,
      description: 'As a consultant, I want milestone notes so that clients stay informed.',
      acceptanceCriteria: 'The notes name the milestone, its date, and its owner.',
      points: 3,
    });
  },
};

/** The passcode gate has run out of attempts for this caller. */
export const throttledUnlock: WorkspaceScenario = {
  name: 'a caller that has used up its passcode attempts',
  apply: (state) => {
    state.fault.throttleUnlock = true;
  },
};

/** The version resource cannot be reached, so no backend build can be reported. */
export const unreachableVersionResource: WorkspaceScenario = {
  name: 'a workspace that cannot read the backend build',
  apply: (state) => {
    state.fault.versionUnreachable = true;
  },
};

/** Reads are slow enough to observe the loading state the frontend renders while it waits. */
export const slowReads: WorkspaceScenario = {
  name: 'a backend that answers reads slowly',
  apply: (state) => {
    state.fault.delayPath = /\/api\/(stories\/backlog|assistants|initiatives\/hierarchy)$/;
    state.fault.delayMs = 1500;
  },
};

/** Saving an assistant is slow enough to observe the form's pending state. */
export const slowAssistantSave: WorkspaceScenario = {
  name: 'a backend that saves slowly',
  apply: (state) => {
    state.fault.delayPath = /\/api\/assistants$/;
    state.fault.delayMs = 1500;
  },
};

function byKey(state: WorkboardApiState, key: string): Story {
  const story = state.stories.find((candidate) => candidate.key === key);
  if (!story) throw new Error(`The seeded workspace has no story ${key}.`);
  return story;
}

function replaceStory(state: WorkboardApiState, story: Story): void {
  const index = state.stories.findIndex((candidate) => candidate.id === story.id);
  state.stories[index] = story;
}

function unassignSprint(state: WorkboardApiState, story: Story): void {
  replaceStory(state, { ...story, sprintId: null, boardStatus: 'toDo' });
}

function sprintStatus(state: WorkboardApiState, story: Story): Sprint['status'] | undefined {
  return state.sprints.find((sprint) => sprint.id === story.sprintId)?.status;
}

function keepSprints(state: WorkboardApiState, keep: (sprint: Sprint) => boolean): void {
  const kept = state.sprints.filter(keep);
  state.sprints.length = 0;
  state.sprints.push(...kept);
}
