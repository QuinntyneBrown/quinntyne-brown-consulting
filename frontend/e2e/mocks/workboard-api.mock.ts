import type {
  ActiveSprintBoard,
  Assistant,
  AssistantHours,
  AssistantHoursStory,
  AssignmentLink,
  Epic,
  Hierarchy,
  Initiative,
  Sprint,
  Story,
  StoryDraft,
  TimeEntry,
  TimeEntryDraft,
} from '@qbc/api';
import type { Page, Route } from '@playwright/test';
import { createWorkboardApiState } from './workboard-api-state.factory';
import type { WorkboardApiState } from './workboard-api-state';

type AssistantDraft = Pick<Assistant, 'fullName' | 'role' | 'specialties' | 'availability'>;
type EpicDraft = Pick<Epic, 'initiativeId' | 'name' | 'summary'>;
type InitiativeDraft = Pick<Initiative, 'name' | 'description'>;
type SprintDraft = Pick<Sprint, 'name' | 'goal' | 'startDate'>;
type FieldErrors = Record<string, string[]>;

/** Time is recorded in quarter hours, and no single entry covers more than a day. */
const HOURS_INCREMENT = 0.25;
const MAXIMUM_HOURS = 24;

/** The only estimates the product accepts, in the order the story editor offers them. */
export const ACCEPTED_ESTIMATES: readonly number[] = [1, 2, 3, 5, 8, 13];

const AVAILABILITIES: readonly Assistant['availability'][] = [
  'available',
  'limited',
  'unavailable',
];

/**
 * A stateful stand-in for the workspace API, answered inside the browser so the acceptance suite
 * needs neither a server process nor a database. It enforces the same relationship, grooming, and
 * lifecycle rules the real API exposes, because the rejection scenarios in `docs/specs/L2.md` are
 * observed through the feedback those rules produce.
 */
/** The resources a caller may read without holding a workspace session. */
const UNGATED = new Set(['/api/access/unlock', '/api/version']);

export class WorkboardApiMock {
  readonly unexpectedRequests: string[] = [];
  /** Every request the browser made that needs a workspace session, as `METHOD /path`. */
  readonly gatedRequests: string[] = [];
  requestCount = 0;

  private readonly state: WorkboardApiState = createWorkboardApiState();

  /** Shape the workspace a scenario starts from, before the browser loads the application. */
  seed(mutate: (state: WorkboardApiState) => void): void {
    mutate(this.state);
  }

  /** End the workspace session, so the credential the browser holds is refused from now on. */
  expireSession(): void {
    this.state.fault.rejectSession = true;
  }

  async install(page: Page): Promise<void> {
    await page.route('**/api/**', (route) => this.handle(route));
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;
    this.requestCount += 1;
    if (!UNGATED.has(path)) this.gatedRequests.push(`${method} ${path}`);

    const { delayPath, delayMs } = this.state.fault;
    if (delayPath?.test(path)) await new Promise((resolve) => setTimeout(resolve, delayMs));

    try {
      if (method === 'POST' && path === '/api/access/unlock') {
        if (this.state.fault.throttleUnlock) {
          return this.problem(
            route,
            429,
            'Too many attempts',
            'Too many passcode attempts. Try again later.',
          );
        }
        const { passcode } = request.postDataJSON() as { passcode: string };
        if (passcode !== this.state.passcode) {
          return this.problem(route, 401, 'Workspace is locked', 'That passcode is not right.');
        }
        return this.json(route, 200, {
          token: 'e2e-workspace-token',
          expiresAtUtc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      if (method === 'GET' && path === '/api/version') {
        if (this.state.fault.versionUnreachable) return route.abort('failed');
        return this.json(route, 200, this.state.deployment);
      }

      if (this.state.fault.rejectSession) {
        return this.problem(
          route,
          401,
          'Workspace is locked',
          'This workspace session has ended. Enter the passcode again.',
        );
      }

      if (method === 'GET' && path === '/api/workspace') {
        return this.json(route, 200, {
          route: url.searchParams.get('route') ?? 'board',
          hasActiveSprint: this.state.sprints.some((sprint) => sprint.status === 'active'),
          backlogCount: this.state.stories.filter((story) => story.sprintId === null).length,
        });
      }

      if (method === 'GET' && path === '/api/initiatives/hierarchy') {
        return this.json(route, 200, this.hierarchy());
      }

      if (path === '/api/initiatives' && method === 'POST') {
        const draft = this.body<InitiativeDraft>(route);
        const errors = this.initiativeErrors(draft);
        if (errors) return this.invalid(route, errors);
        const initiative: Initiative = { id: this.newId(), ...draft };
        this.state.initiatives.push(initiative);
        return this.json(route, 201, initiative);
      }

      const initiativeMatch = path.match(/^\/api\/initiatives\/([^/]+)$/);
      if (initiativeMatch && method === 'GET') {
        const initiative = this.state.initiatives.find((item) => item.id === initiativeMatch[1]);
        if (!initiative) return this.notFound(route, 'Initiative');
        return this.json(route, 200, initiative);
      }
      if (initiativeMatch && method === 'PUT') {
        const id = initiativeMatch[1];
        if (!this.state.initiatives.some((item) => item.id === id))
          return this.notFound(route, 'Initiative');
        const draft = this.body<InitiativeDraft>(route);
        const errors = this.initiativeErrors(draft);
        if (errors) return this.invalid(route, errors);
        const initiative: Initiative = { id, ...draft };
        this.replace(this.state.initiatives, id, initiative);
        return this.json(route, 200, initiative);
      }
      if (initiativeMatch && method === 'DELETE') {
        const id = initiativeMatch[1];
        if (!this.state.initiatives.some((item) => item.id === id))
          return this.notFound(route, 'Initiative');
        if (this.state.epics.some((epic) => epic.initiativeId === id)) {
          return this.problem(
            route,
            409,
            'Initiative has epics',
            'Delete or move the initiative epics first.',
          );
        }
        this.remove(this.state.initiatives, id);
        return this.empty(route);
      }

      if (path === '/api/epics' && method === 'POST') {
        const draft = this.body<EpicDraft>(route);
        if (!this.state.initiatives.some((item) => item.id === draft.initiativeId))
          return this.notFound(route, 'Initiative');
        const errors = this.epicErrors(draft);
        if (errors) return this.invalid(route, errors);
        const epic: Epic = { id: this.newId(), ...draft };
        this.state.epics.push(epic);
        return this.json(route, 201, epic);
      }

      const epicMatch = path.match(/^\/api\/epics\/([^/]+)$/);
      if (epicMatch && method === 'GET') {
        const epic = this.state.epics.find((item) => item.id === epicMatch[1]);
        return epic ? this.json(route, 200, epic) : this.notFound(route, 'Epic');
      }
      if (epicMatch && method === 'PUT') {
        const id = epicMatch[1];
        if (!this.state.epics.some((item) => item.id === id)) return this.notFound(route, 'Epic');
        const draft = this.body<EpicDraft>(route);
        if (!this.state.initiatives.some((item) => item.id === draft.initiativeId))
          return this.notFound(route, 'Initiative');
        const errors = this.epicErrors(draft);
        if (errors) return this.invalid(route, errors);
        const epic: Epic = { id, ...draft };
        this.replace(this.state.epics, id, epic);
        return this.json(route, 200, epic);
      }
      if (epicMatch && method === 'DELETE') {
        const id = epicMatch[1];
        if (!this.state.epics.some((item) => item.id === id)) return this.notFound(route, 'Epic');
        if (this.state.stories.some((story) => story.epicId === id)) {
          return this.problem(
            route,
            409,
            'Epic has stories',
            'Delete or move the epic stories first.',
          );
        }
        this.remove(this.state.epics, id);
        return this.empty(route);
      }

      if (path === '/api/assistants' && method === 'GET') {
        return this.json(
          route,
          200,
          this.state.assistants.map((assistant) => this.assistantView(assistant)),
        );
      }
      if (path === '/api/assistants' && method === 'POST') {
        const draft = this.body<AssistantDraft>(route);
        const errors = this.assistantErrors(draft);
        if (errors) return this.invalid(route, errors);
        const assistant: Assistant = {
          id: this.newId(),
          ...draft,
          storyCount: 0,
          incompleteTaskCount: 0,
          blockingAssignments: [],
        };
        this.state.assistants.push(assistant);
        return this.json(route, 201, this.assistantView(assistant));
      }

      const assistantMatch = path.match(/^\/api\/assistants\/([^/]+)$/);
      if (assistantMatch && method === 'GET') {
        const assistant = this.state.assistants.find((item) => item.id === assistantMatch[1]);
        return assistant
          ? this.json(route, 200, this.assistantView(assistant))
          : this.notFound(route, 'Assistant');
      }
      if (assistantMatch && method === 'PUT') {
        const id = assistantMatch[1];
        const existing = this.state.assistants.find((item) => item.id === id);
        if (!existing) return this.notFound(route, 'Assistant');
        const draft = this.body<AssistantDraft>(route);
        const errors = this.assistantErrors(draft);
        if (errors) return this.invalid(route, errors);
        const assistant: Assistant = {
          id,
          ...draft,
          storyCount: existing.storyCount,
          incompleteTaskCount: existing.incompleteTaskCount,
          blockingAssignments: existing.blockingAssignments,
        };
        this.replace(this.state.assistants, id, assistant);
        return this.json(route, 200, this.assistantView(assistant));
      }
      if (assistantMatch && method === 'DELETE') {
        const id = assistantMatch[1];
        if (!this.state.assistants.some((item) => item.id === id))
          return this.notFound(route, 'Assistant');
        const blockingAssignments = this.blockingAssignments(id);
        if (blockingAssignments.length > 0) {
          return this.problem(
            route,
            409,
            'Assistant has assigned work',
            'Reassign work before deleting this assistant.',
            blockingAssignments,
          );
        }
        this.remove(this.state.assistants, id);
        return this.empty(route);
      }

      const hoursMatch = path.match(/^\/api\/assistants\/([^/]+)\/hours$/);
      if (hoursMatch && method === 'GET') {
        const assistant = this.state.assistants.find((item) => item.id === hoursMatch[1]);
        return assistant
          ? this.json(route, 200, this.assistantHours(assistant))
          : this.notFound(route, 'Assistant');
      }

      if (path === '/api/time-entries' && method === 'POST') {
        const draft = this.body<TimeEntryDraft>(route);
        const story = this.state.stories.find((item) => item.id === draft.storyId);
        if (!story) return this.notFound(route, 'Story');
        const assistant = this.state.assistants.find((item) => item.id === draft.assistantId);
        if (!assistant) return this.notFound(route, 'Assistant');
        const errors = this.timeEntryErrors(draft);
        if (errors) return this.invalid(route, errors);
        const entry: TimeEntry = {
          id: this.newId(),
          storyId: story.id,
          storyKey: story.key,
          assistantId: assistant.id,
          assistantName: assistant.fullName,
          workedOn: draft.workedOn,
          hours: draft.hours,
          note: draft.note.trim(),
        };
        this.state.timeEntries.push(entry);
        return this.json(route, 201, entry);
      }

      const timeEntryMatch = path.match(/^\/api\/time-entries\/([^/]+)$/);
      if (timeEntryMatch && method === 'DELETE') {
        const id = timeEntryMatch[1];
        if (!this.state.timeEntries.some((item) => item.id === id))
          return this.notFound(route, 'Time entry');
        this.remove(this.state.timeEntries, id);
        return this.empty(route);
      }

      if (method === 'GET' && path === '/api/stories/backlog') {
        const stories = [...this.state.stories]
          .sort((left, right) => Number(right.key.slice(4)) - Number(left.key.slice(4)))
          .map((story) => this.storyView(story));
        return this.json(route, 200, stories);
      }

      if (path === '/api/stories' && method === 'POST') {
        const draft = this.body<StoryDraft>(route);
        if (!this.state.epics.some((epic) => epic.id === draft.epicId))
          return this.notFound(route, 'Epic');
        const errors = this.storyErrors(draft);
        if (errors) return this.invalid(route, errors);
        const story: Story = {
          id: this.newId(),
          key: `QBC-${this.state.nextStoryNumber++}`,
          epicId: draft.epicId,
          epicName: '',
          initiativeName: '',
          title: draft.title,
          description: draft.description,
          acceptanceCriteria: draft.acceptanceCriteria,
          points: draft.points,
          assistantId: draft.assistantId,
          assistantName: null,
          lifecycle: 'draft',
          isReady: false,
          sprintId: null,
          sprintName: null,
          sprintStatus: null,
          boardStatus: 'toDo',
          tasks: draft.tasks.map((task) => ({
            id: task.id ?? this.newId(),
            title: task.title,
            isComplete: task.isComplete,
            assistantId: task.assistantId,
            assistantName: null,
          })),
        };
        this.state.stories.push(story);
        return this.json(route, 201, this.storyView(story));
      }

      const storyActionMatch = path.match(
        /^\/api\/stories\/([^/]+)\/(groom|mark-unready|archive|restore|move)$/,
      );
      if (storyActionMatch && method === 'POST') {
        const id = storyActionMatch[1];
        const action = storyActionMatch[2];
        const story = this.state.stories.find((item) => item.id === id);
        if (!story) return this.notFound(route, 'Story');
        let updated: Story = story;
        switch (action) {
          case 'groom': {
            const errors = this.groomingErrors(story);
            if (errors) return this.invalid(route, errors);
            updated = { ...story, lifecycle: 'active', isReady: true };
            break;
          }
          case 'mark-unready':
            if (this.isSprintHistory(story)) return this.sprintHistory(route);
            if (this.isPlanned(story)) {
              return this.problem(
                route,
                409,
                'Story is planned',
                'Remove the story from its sprint before marking it unready.',
              );
            }
            updated = { ...story, isReady: false };
            break;
          case 'archive':
            if (this.isSprintHistory(story)) return this.sprintHistory(route);
            updated = {
              ...story,
              lifecycle: 'archived',
              isReady: false,
              sprintId: null,
              boardStatus: 'toDo',
            };
            break;
          case 'restore':
            updated = {
              ...story,
              lifecycle: 'draft',
              isReady: false,
              sprintId: null,
              boardStatus: 'toDo',
            };
            break;
          case 'move': {
            if (this.sprintOf(story)?.status !== 'active') {
              return this.problem(
                route,
                409,
                'Story is not on the board',
                'Only a story in the active sprint can change board status.',
              );
            }
            updated = {
              ...story,
              boardStatus: this.body<{ readonly status: Story['boardStatus'] }>(route).status,
            };
            break;
          }
        }
        this.replace(this.state.stories, id, updated);
        return this.json(route, 200, this.storyView(updated));
      }

      const storyMatch = path.match(/^\/api\/stories\/([^/]+)$/);
      if (storyMatch && method === 'GET') {
        const story = this.state.stories.find((item) => item.id === storyMatch[1]);
        return story ? this.json(route, 200, this.storyView(story)) : this.notFound(route, 'Story');
      }
      if (storyMatch && method === 'PUT') {
        const id = storyMatch[1];
        const story = this.state.stories.find((item) => item.id === id);
        if (!story) return this.notFound(route, 'Story');
        const draft = this.body<StoryDraft>(route);
        if (!this.state.epics.some((epic) => epic.id === draft.epicId))
          return this.notFound(route, 'Epic');
        const errors = this.storyErrors(draft);
        if (errors) return this.invalid(route, errors);
        const updated: Story = {
          ...story,
          epicId: draft.epicId,
          title: draft.title,
          description: draft.description,
          acceptanceCriteria: draft.acceptanceCriteria,
          points: draft.points,
          assistantId: draft.assistantId,
          tasks: draft.tasks.map((task) => ({
            id: task.id ?? this.newId(),
            title: task.title,
            isComplete: task.isComplete,
            assistantId: task.assistantId,
            assistantName: null,
          })),
        };
        this.replace(this.state.stories, id, updated);
        return this.json(route, 200, this.storyView(updated));
      }
      if (storyMatch && method === 'DELETE') {
        const id = storyMatch[1];
        const story = this.state.stories.find((item) => item.id === id);
        if (!story) return this.notFound(route, 'Story');
        if (this.isSprintHistory(story)) return this.sprintHistory(route);
        this.remove(this.state.stories, id);
        return this.empty(route);
      }

      if (method === 'GET' && path === '/api/sprints/active/board') {
        return this.json(route, 200, this.activeBoard());
      }
      if (path === '/api/sprints' && method === 'GET') {
        return this.json(
          route,
          200,
          this.state.sprints.map((sprint) => this.sprintView(sprint)),
        );
      }
      if (path === '/api/sprints' && method === 'POST') {
        const draft = this.body<SprintDraft>(route);
        const errors = this.sprintErrors(draft, null, false);
        if (errors) return this.invalid(route, errors);
        const sprint: Sprint = {
          id: this.newId(),
          ...draft,
          endDate: this.endDate(draft.startDate),
          status: 'planned',
          storyCount: 0,
          storyKeys: [],
        };
        this.state.sprints.push(sprint);
        return this.json(route, 201, this.sprintView(sprint));
      }

      const sprintStoryMatch = path.match(/^\/api\/sprints\/([^/]+)\/stories\/([^/]+)$/);
      if (sprintStoryMatch && (method === 'PUT' || method === 'DELETE')) {
        const sprintId = sprintStoryMatch[1];
        const sprint = this.state.sprints.find((item) => item.id === sprintId);
        if (!sprint) return this.notFound(route, 'Sprint');
        const story = this.state.stories.find((item) => item.id === sprintStoryMatch[2]);
        if (!story) return this.notFound(route, 'Story');
        if (sprint.status === 'completed') return this.sprintHistory(route);
        if (method === 'PUT') {
          const rejection = this.assignmentRejection(story);
          if (rejection) return this.problem(route, 409, 'Story cannot be planned', rejection);
        }
        this.replace(this.state.stories, story.id, {
          ...story,
          sprintId: method === 'PUT' ? sprintId : null,
          boardStatus: 'toDo',
        });
        return this.empty(route);
      }

      const sprintActionMatch = path.match(/^\/api\/sprints\/([^/]+)\/(start|complete)$/);
      if (sprintActionMatch && method === 'POST') {
        const id = sprintActionMatch[1];
        const action = sprintActionMatch[2];
        const sprint = this.state.sprints.find((item) => item.id === id);
        if (!sprint) return this.notFound(route, 'Sprint');
        if (action === 'start') {
          if (sprint.status !== 'planned') {
            return this.problem(
              route,
              409,
              'Sprint cannot start',
              'Only a planned sprint can be started.',
            );
          }
          if (this.state.sprints.some((item) => item.status === 'active')) {
            return this.problem(
              route,
              409,
              'An active sprint already exists',
              'Complete the active sprint before starting another one.',
            );
          }
          const started: Sprint = { ...sprint, status: 'active' };
          this.replace(this.state.sprints, id, started);
          return this.json(route, 200, this.sprintView(started));
        }

        if (sprint.status !== 'active') {
          return this.problem(
            route,
            409,
            'Sprint cannot complete',
            'Only the active sprint can be completed.',
          );
        }
        const completed: Sprint = { ...sprint, status: 'completed' };
        this.replace(this.state.sprints, id, completed);
        for (const story of this.state.stories.filter(
          (item) => item.sprintId === id && item.boardStatus !== 'done',
        )) {
          this.replace(this.state.stories, story.id, {
            ...story,
            sprintId: null,
            boardStatus: 'toDo',
          });
        }
        return this.json(route, 200, this.sprintView(completed));
      }

      const sprintMatch = path.match(/^\/api\/sprints\/([^/]+)$/);
      if (sprintMatch && method === 'GET') {
        const sprint = this.state.sprints.find((item) => item.id === sprintMatch[1]);
        return sprint
          ? this.json(route, 200, this.sprintView(sprint))
          : this.notFound(route, 'Sprint');
      }
      if (sprintMatch && method === 'PUT') {
        const id = sprintMatch[1];
        const sprint = this.state.sprints.find((item) => item.id === id);
        if (!sprint) return this.notFound(route, 'Sprint');
        const draft = this.body<SprintDraft>(route);
        const history = sprint.status === 'completed';
        const errors = this.sprintErrors(draft, id, history);
        if (errors) return this.invalid(route, errors);
        // A completed sprint is history: only its display name and goal may be corrected.
        const updated: Sprint = history
          ? { ...sprint, name: draft.name, goal: draft.goal }
          : { ...sprint, ...draft, endDate: this.endDate(draft.startDate) };
        this.replace(this.state.sprints, id, updated);
        return this.json(route, 200, this.sprintView(updated));
      }
      if (sprintMatch && method === 'DELETE') {
        const id = sprintMatch[1];
        const sprint = this.state.sprints.find((item) => item.id === id);
        if (!sprint) return this.notFound(route, 'Sprint');
        if (sprint.status !== 'planned') {
          return this.problem(
            route,
            409,
            'Sprint cannot be deleted',
            'Only a planned sprint can be deleted.',
          );
        }
        for (const story of this.state.stories.filter((item) => item.sprintId === id)) {
          this.replace(this.state.stories, story.id, {
            ...story,
            sprintId: null,
            boardStatus: 'toDo',
          });
        }
        this.remove(this.state.sprints, id);
        return this.empty(route);
      }

      this.unexpectedRequests.push(`${method} ${path}`);
      return this.problem(
        route,
        501,
        'Unhandled mock API request',
        `${method} ${path} has no E2E mock handler.`,
      );
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : 'The mock API could not process the request.';
      return this.problem(route, 500, 'Mock API failure', detail);
    }
  }

  private initiativeErrors(draft: InitiativeDraft): FieldErrors | null {
    return this.errors({
      name: this.blank(draft.name) ? 'Enter a name.' : null,
      description: this.describeBrief(draft.description),
    });
  }

  /** The outcome brief is markdown, required, and bounded exactly as the API bounds it. */
  private describeBrief(description: string): string | null {
    if (this.blank(description)) return 'Enter an outcome description.';
    return description.length > 100_000 ? 'Description must be 100,000 characters or fewer.' : null;
  }

  private epicErrors(draft: EpicDraft): FieldErrors | null {
    return this.errors({
      name: this.blank(draft.name) ? 'Enter a name.' : null,
      summary: this.describeSummary(draft.summary),
    });
  }

  /** The summary carries the epic's markdown, so it is bounded exactly as a brief is. */
  private describeSummary(summary: string): string | null {
    if (this.blank(summary)) return 'Enter a summary.';
    return summary.length > 100_000 ? 'Summary must be 100,000 characters or fewer.' : null;
  }

  private assistantErrors(draft: AssistantDraft): FieldErrors | null {
    return this.errors({
      fullName: this.blank(draft.fullName) ? 'Enter a full name.' : null,
      role: this.blank(draft.role) ? 'Enter a role.' : null,
      availability: AVAILABILITIES.includes(draft.availability)
        ? null
        : 'Choose Available, Limited, or Unavailable.',
    });
  }

  private storyErrors(draft: StoryDraft): FieldErrors | null {
    const fields: Record<string, string | null> = {
      title: this.blank(draft.title) ? 'Enter a title.' : null,
      points: this.validEstimate(draft.points) ? null : 'Estimate in 1, 2, 3, 5, 8, or 13 points.',
    };
    draft.tasks.forEach((task, index) => {
      fields[`tasks[${index}].title`] = this.blank(task.title) ? 'Enter a task title.' : null;
    });
    return this.errors(fields);
  }

  private groomingErrors(story: Story): FieldErrors | null {
    return this.errors({
      title: this.blank(story.title) ? 'Enter a title.' : null,
      epicId: this.state.epics.some((epic) => epic.id === story.epicId) ? null : 'Choose an epic.',
      description: this.blank(story.description) ? 'Describe the story.' : null,
      acceptanceCriteria: this.blank(story.acceptanceCriteria)
        ? 'Enter acceptance criteria.'
        : null,
      points:
        story.points !== null && this.validEstimate(story.points)
          ? null
          : 'Estimate the story before marking it Ready.',
    });
  }

  private sprintErrors(
    draft: SprintDraft,
    id: string | null,
    history: boolean,
  ): FieldErrors | null {
    const name = (draft.name ?? '').trim().toLowerCase();
    const duplicate = this.state.sprints.some(
      (sprint) => sprint.id !== id && sprint.name.trim().toLowerCase() === name,
    );
    return this.errors({
      name: this.blank(draft.name)
        ? 'Enter a name.'
        : duplicate
          ? 'Another sprint already uses that name.'
          : null,
      goal: this.blank(draft.goal) ? 'Enter a goal.' : null,
      // A completed sprint keeps the dates it ran on, so its start date is not revalidated.
      startDate: history || this.validDate(draft.startDate) ? null : 'Choose a valid start date.',
    });
  }

  /** Why this story may not be planned, or null when it is eligible. */
  private assignmentRejection(story: Story): string | null {
    if (story.lifecycle === 'archived') return 'An archived story cannot be planned.';
    if (!story.isReady) return 'Groom the story before planning it.';
    if (this.isSprintHistory(story))
      return 'A story kept in a completed sprint cannot be replanned.';
    return null;
  }

  private isSprintHistory(story: Story): boolean {
    return this.sprintOf(story)?.status === 'completed';
  }

  private isPlanned(story: Story): boolean {
    const status = this.sprintOf(story)?.status;
    return status === 'planned' || status === 'active';
  }

  private sprintOf(story: Story): Sprint | undefined {
    return this.state.sprints.find((sprint) => sprint.id === story.sprintId);
  }

  private hierarchy(): Hierarchy {
    return {
      initiatives: this.state.initiatives.map((initiative) => {
        const epics = this.state.epics.filter((epic) => epic.initiativeId === initiative.id);
        const stories = this.live().filter((story) =>
          epics.some((epic) => epic.id === story.epicId),
        );
        return {
          ...initiative,
          epicCount: epics.length,
          storyCount: stories.length,
          epics: epics.map((epic) => {
            const epicStories = stories.filter((story) => story.epicId === epic.id);
            const completed = epicStories.filter((story) => story.boardStatus === 'done').length;
            return {
              id: epic.id,
              name: epic.name,
              summary: epic.summary,
              storyCount: epicStories.length,
              completionPercentage:
                epicStories.length === 0 ? 0 : Math.round((completed / epicStories.length) * 100),
            };
          }),
        };
      }),
    };
  }

  private assistantView(assistant: Assistant): Assistant {
    return {
      ...assistant,
      storyCount: this.live().filter((story) => story.assistantId === assistant.id).length,
      incompleteTaskCount: this.live()
        .flatMap((story) => story.tasks)
        .filter((task) => task.assistantId === assistant.id && !task.isComplete).length,
      blockingAssignments: this.blockingAssignments(assistant.id),
    };
  }

  /**
   * One assistant's logged hours. A story counts as worked on when they have hours against it,
   * and it counts as completed when it is on the board's Done column now.
   */
  private assistantHours(assistant: Assistant): AssistantHours {
    const own = this.state.timeEntries.filter((entry) => entry.assistantId === assistant.id);
    const storyIds = [...new Set(own.map((entry) => entry.storyId))];
    const stories: AssistantHoursStory[] = storyIds
      .map((storyId) => {
        const story = this.state.stories.find((item) => item.id === storyId)!;
        const entries = own
          .filter((entry) => entry.storyId === storyId)
          .sort((left, right) => left.workedOn.localeCompare(right.workedOn));
        return {
          storyId: story.id,
          storyKey: story.key,
          title: story.title,
          epicName: this.state.epics.find((item) => item.id === story.epicId)?.name ?? '',
          boardStatus: story.boardStatus,
          isComplete: story.boardStatus === 'done',
          points: story.points,
          hours: this.sum(entries),
          storyHours: this.sum(this.state.timeEntries.filter((entry) => entry.storyId === storyId)),
          entries,
        };
      })
      .sort(
        (left, right) =>
          right.entries[right.entries.length - 1].workedOn.localeCompare(
            left.entries[left.entries.length - 1].workedOn,
          ) || left.storyKey.localeCompare(right.storyKey),
      );
    const completed = stories.filter((story) => story.isComplete);
    return {
      assistantId: assistant.id,
      fullName: assistant.fullName,
      role: assistant.role,
      specialties: assistant.specialties,
      availability: assistant.availability,
      hoursLogged: this.sum(own),
      hoursOnCompletedStories: completed.reduce((total, story) => total + story.hours, 0),
      storiesWorkedOn: stories.length,
      completedStoriesWorkedOn: completed.length,
      stories,
    };
  }

  private sum(entries: readonly TimeEntry[]): number {
    return entries.reduce((total, entry) => total + entry.hours, 0);
  }

  private blockingAssignments(assistantId: string): AssignmentLink[] {
    const assignments: AssignmentLink[] = [];
    // Hours the assistant logged block a delete too, and a story they no longer own can still be
    // holding their time.
    for (const storyId of new Set(
      this.state.timeEntries
        .filter((entry) => entry.assistantId === assistantId)
        .map((entry) => entry.storyId),
    )) {
      const story = this.state.stories.find((item) => item.id === storyId);
      if (story && story.assistantId !== assistantId)
        assignments.push({
          storyId: story.id,
          storyKey: story.key,
          taskId: null,
          label: story.title,
        });
    }
    for (const story of this.state.stories) {
      if (story.assistantId === assistantId) {
        assignments.push({
          storyId: story.id,
          storyKey: story.key,
          taskId: null,
          label: story.title,
        });
      }
      for (const task of story.tasks.filter(
        (item) => item.assistantId === assistantId && !item.isComplete,
      )) {
        assignments.push({
          storyId: story.id,
          storyKey: story.key,
          taskId: task.id,
          label: task.title,
        });
      }
    }
    return assignments;
  }

  private storyView(story: Story): Story {
    const epic = this.state.epics.find((item) => item.id === story.epicId);
    const initiative = this.state.initiatives.find((item) => item.id === epic?.initiativeId);
    const assistant = this.state.assistants.find((item) => item.id === story.assistantId);
    const sprint = this.sprintOf(story);
    return {
      ...story,
      epicName: epic?.name ?? '',
      initiativeName: initiative?.name ?? '',
      assistantName: assistant?.fullName ?? null,
      sprintName: sprint?.name ?? null,
      sprintStatus: sprint?.status ?? null,
      tasks: story.tasks.map((task) => ({
        ...task,
        assistantName:
          this.state.assistants.find((item) => item.id === task.assistantId)?.fullName ?? null,
      })),
    };
  }

  private sprintView(sprint: Sprint): Sprint {
    const stories = this.state.stories.filter((story) => story.sprintId === sprint.id);
    return { ...sprint, storyCount: stories.length, storyKeys: stories.map((story) => story.key) };
  }

  private activeBoard(): ActiveSprintBoard | null {
    const sprint = this.state.sprints.find((item) => item.status === 'active');
    if (!sprint) return null;
    const stories = this.live()
      .filter((story) => story.sprintId === sprint.id)
      .map((story) => this.storyView(story));
    const doneCount = stories.filter((story) => story.boardStatus === 'done').length;
    return {
      sprintId: sprint.id,
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      doneCount,
      totalCount: stories.length,
      completionPercentage:
        stories.length === 0 ? 0 : Math.round((doneCount / stories.length) * 100),
      stories: stories.map((story) => ({
        storyId: story.id,
        key: story.key,
        title: story.title,
        epicName: story.epicName,
        points: story.points,
        assistantId: story.assistantId,
        assistantName: story.assistantName,
        completedTasks: story.tasks.filter((task) => task.isComplete).length,
        totalTasks: story.tasks.length,
        boardStatus: story.boardStatus,
      })),
    };
  }

  /** The stories the product counts as current work: everything that is not archived. */
  private live(): Story[] {
    return this.state.stories.filter((story) => story.lifecycle !== 'archived');
  }

  private errors(fields: Record<string, string | null>): FieldErrors | null {
    const entries = Object.entries(fields).filter(
      (entry): entry is [string, string] => entry[1] !== null,
    );
    if (entries.length === 0) return null;
    return Object.fromEntries(entries.map(([field, message]) => [field, [message]]));
  }

  private timeEntryErrors(draft: TimeEntryDraft): FieldErrors | null {
    return this.errors({
      workedOn: this.validDate(draft.workedOn) ? null : 'A date worked is required.',
      hours:
        draft.hours > 0 && draft.hours <= MAXIMUM_HOURS && draft.hours % HOURS_INCREMENT === 0
          ? null
          : 'Hours must be greater than zero, no more than 24, and in quarter-hour increments.',
    });
  }

  private blank(value: string | null | undefined): boolean {
    return (value ?? '').trim().length === 0;
  }

  private validEstimate(points: number | null): boolean {
    return points === null || ACCEPTED_ESTIMATES.includes(points);
  }

  private validDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') && !Number.isNaN(Date.parse(value));
  }

  private body<T>(route: Route): T {
    return route.request().postDataJSON() as T;
  }

  private endDate(startDate: string): string {
    const end = new Date(`${startDate}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 13);
    return end.toISOString().slice(0, 10);
  }

  private newId(): string {
    const suffix = String(this.state.nextEntityNumber++).padStart(12, '0');
    return `90000000-0000-4000-8000-${suffix}`;
  }

  private replace<T extends { readonly id: string }>(items: T[], id: string, item: T): void {
    const index = items.findIndex((candidate) => candidate.id === id);
    if (index >= 0) items[index] = item;
  }

  private remove<T extends { readonly id: string }>(items: T[], id: string): void {
    const index = items.findIndex((candidate) => candidate.id === id);
    if (index >= 0) items.splice(index, 1);
  }

  private async json(route: Route, status: number, value: unknown): Promise<void> {
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
  }

  private async empty(route: Route): Promise<void> {
    await route.fulfill({ status: 204, body: '' });
  }

  private async notFound(route: Route, resource: string): Promise<void> {
    await this.problem(
      route,
      404,
      `${resource} not found`,
      `The requested ${resource.toLowerCase()} does not exist.`,
    );
  }

  private async sprintHistory(route: Route): Promise<void> {
    await this.problem(
      route,
      409,
      'Sprint history is preserved',
      'A story recorded in a completed sprint cannot be changed.',
    );
  }

  private async invalid(route: Route, errors: FieldErrors): Promise<void> {
    await this.problem(
      route,
      400,
      'Validation failed',
      'The request contains one or more invalid fields.',
      undefined,
      errors,
    );
  }

  private async problem(
    route: Route,
    status: number,
    title: string,
    detail: string,
    context?: unknown,
    errors?: FieldErrors,
  ): Promise<void> {
    await route.fulfill({
      status,
      contentType: 'application/problem+json',
      body: JSON.stringify({
        type: 'about:blank',
        title,
        status,
        detail,
        ...(context === undefined ? {} : { context }),
        ...(errors === undefined ? {} : { errors }),
      }),
    });
  }
}
