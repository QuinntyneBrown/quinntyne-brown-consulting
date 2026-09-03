import type {
  ActiveSprintBoard,
  Assistant,
  AssignmentLink,
  Epic,
  Hierarchy,
  Initiative,
  Sprint,
  Story,
  StoryDraft
} from '@qbc/api';
import type { Page, Route } from '@playwright/test';
import { createWorkboardApiState } from './workboard-api-state.factory';
import type { WorkboardApiState } from './workboard-api-state';

type AssistantDraft = Pick<Assistant, 'fullName' | 'role' | 'specialties' | 'availability'>;
type EpicDraft = Pick<Epic, 'initiativeId' | 'name' | 'summary'>;
type InitiativeDraft = Pick<Initiative, 'name' | 'description'>;
type SprintDraft = Pick<Sprint, 'name' | 'goal' | 'startDate'>;

export class WorkboardApiMock {
  readonly unexpectedRequests: string[] = [];
  requestCount = 0;

  private readonly state: WorkboardApiState = createWorkboardApiState();

  async install(page: Page): Promise<void> {
    await page.route('**/api/**', route => this.handle(route));
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;
    this.requestCount += 1;

    try {
      if (method === 'GET' && path === '/api/workspace') {
        return this.json(route, 200, {
          route: url.searchParams.get('route') ?? 'board',
          hasActiveSprint: this.state.sprints.some(sprint => sprint.status === 'active'),
          backlogCount: this.state.stories.filter(story => story.sprintId === null).length
        });
      }

      if (method === 'GET' && path === '/api/initiatives/hierarchy') {
        return this.json(route, 200, this.hierarchy());
      }

      if (path === '/api/initiatives' && method === 'POST') {
        const draft = this.body<InitiativeDraft>(route);
        const initiative: Initiative = { id: this.newId(), ...draft };
        this.state.initiatives.push(initiative);
        return this.json(route, 201, initiative);
      }

      const initiativeMatch = path.match(/^\/api\/initiatives\/([^/]+)$/);
      if (initiativeMatch && method === 'PUT') {
        const id = initiativeMatch[1];
        const existing = this.state.initiatives.find(item => item.id === id);
        if (!existing) return this.notFound(route, 'Initiative');
        const initiative: Initiative = { id, ...this.body<InitiativeDraft>(route) };
        this.replace(this.state.initiatives, id, initiative);
        return this.json(route, 200, initiative);
      }
      if (initiativeMatch && method === 'DELETE') {
        const id = initiativeMatch[1];
        if (!this.state.initiatives.some(item => item.id === id)) return this.notFound(route, 'Initiative');
        if (this.state.epics.some(epic => epic.initiativeId === id)) {
          return this.problem(route, 409, 'Initiative has epics', 'Delete or move the initiative epics first.');
        }
        this.remove(this.state.initiatives, id);
        return this.empty(route);
      }

      if (path === '/api/epics' && method === 'POST') {
        const draft = this.body<EpicDraft>(route);
        if (!this.state.initiatives.some(item => item.id === draft.initiativeId)) return this.notFound(route, 'Initiative');
        const epic: Epic = { id: this.newId(), ...draft };
        this.state.epics.push(epic);
        return this.json(route, 201, epic);
      }

      const epicMatch = path.match(/^\/api\/epics\/([^/]+)$/);
      if (epicMatch && method === 'PUT') {
        const id = epicMatch[1];
        if (!this.state.epics.some(item => item.id === id)) return this.notFound(route, 'Epic');
        const epic: Epic = { id, ...this.body<EpicDraft>(route) };
        this.replace(this.state.epics, id, epic);
        return this.json(route, 200, epic);
      }
      if (epicMatch && method === 'DELETE') {
        const id = epicMatch[1];
        if (!this.state.epics.some(item => item.id === id)) return this.notFound(route, 'Epic');
        if (this.state.stories.some(story => story.epicId === id)) {
          return this.problem(route, 409, 'Epic has stories', 'Delete or move the epic stories first.');
        }
        this.remove(this.state.epics, id);
        return this.empty(route);
      }

      if (path === '/api/assistants' && method === 'GET') {
        return this.json(route, 200, this.state.assistants.map(assistant => this.assistantView(assistant)));
      }
      if (path === '/api/assistants' && method === 'POST') {
        const assistant: Assistant = {
          id: this.newId(),
          ...this.body<AssistantDraft>(route),
          storyCount: 0,
          incompleteTaskCount: 0,
          blockingAssignments: []
        };
        this.state.assistants.push(assistant);
        return this.json(route, 201, this.assistantView(assistant));
      }

      const assistantMatch = path.match(/^\/api\/assistants\/([^/]+)$/);
      if (assistantMatch && method === 'GET') {
        const assistant = this.state.assistants.find(item => item.id === assistantMatch[1]);
        return assistant ? this.json(route, 200, this.assistantView(assistant)) : this.notFound(route, 'Assistant');
      }
      if (assistantMatch && method === 'PUT') {
        const id = assistantMatch[1];
        const existing = this.state.assistants.find(item => item.id === id);
        if (!existing) return this.notFound(route, 'Assistant');
        const assistant: Assistant = {
          id,
          ...this.body<AssistantDraft>(route),
          storyCount: existing.storyCount,
          incompleteTaskCount: existing.incompleteTaskCount,
          blockingAssignments: existing.blockingAssignments
        };
        this.replace(this.state.assistants, id, assistant);
        return this.json(route, 200, this.assistantView(assistant));
      }
      if (assistantMatch && method === 'DELETE') {
        const id = assistantMatch[1];
        const assistant = this.state.assistants.find(item => item.id === id);
        if (!assistant) return this.notFound(route, 'Assistant');
        const blockingAssignments = this.blockingAssignments(id);
        if (blockingAssignments.length > 0) {
          return this.problem(route, 409, 'Assistant has assigned work', 'Reassign work before deleting this assistant.', blockingAssignments);
        }
        this.remove(this.state.assistants, id);
        return this.empty(route);
      }

      if (method === 'GET' && path === '/api/stories/backlog') {
        const stories = [...this.state.stories]
          .sort((left, right) => Number(right.key.slice(4)) - Number(left.key.slice(4)))
          .map(story => this.storyView(story));
        return this.json(route, 200, stories);
      }

      if (path === '/api/stories' && method === 'POST') {
        const draft = this.body<StoryDraft>(route);
        if (!this.state.epics.some(epic => epic.id === draft.epicId)) return this.notFound(route, 'Epic');
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
          tasks: draft.tasks.map(task => ({
            id: task.id ?? this.newId(),
            title: task.title,
            isComplete: task.isComplete,
            assistantId: task.assistantId,
            assistantName: null
          }))
        };
        this.state.stories.push(story);
        return this.json(route, 201, this.storyView(story));
      }

      const storyActionMatch = path.match(/^\/api\/stories\/([^/]+)\/(groom|mark-unready|archive|restore|move)$/);
      if (storyActionMatch && method === 'POST') {
        const id = storyActionMatch[1];
        const action = storyActionMatch[2];
        const story = this.state.stories.find(item => item.id === id);
        if (!story) return this.notFound(route, 'Story');
        let updated: Story = story;
        switch (action) {
          case 'groom':
            updated = { ...story, lifecycle: 'active', isReady: true };
            break;
          case 'mark-unready':
            updated = { ...story, isReady: false };
            break;
          case 'archive':
            updated = { ...story, lifecycle: 'archived', isReady: false, sprintId: null, boardStatus: 'toDo' };
            break;
          case 'restore':
            updated = { ...story, lifecycle: 'draft', isReady: false, sprintId: null, boardStatus: 'toDo' };
            break;
          case 'move':
            updated = { ...story, boardStatus: this.body<{ readonly status: Story['boardStatus'] }>(route).status };
            break;
        }
        this.replace(this.state.stories, id, updated);
        return this.json(route, 200, this.storyView(updated));
      }

      const storyMatch = path.match(/^\/api\/stories\/([^/]+)$/);
      if (storyMatch && method === 'GET') {
        const story = this.state.stories.find(item => item.id === storyMatch[1]);
        return story ? this.json(route, 200, this.storyView(story)) : this.notFound(route, 'Story');
      }
      if (storyMatch && method === 'PUT') {
        const id = storyMatch[1];
        const story = this.state.stories.find(item => item.id === id);
        if (!story) return this.notFound(route, 'Story');
        const draft = this.body<StoryDraft>(route);
        const updated: Story = {
          ...story,
          epicId: draft.epicId,
          title: draft.title,
          description: draft.description,
          acceptanceCriteria: draft.acceptanceCriteria,
          points: draft.points,
          assistantId: draft.assistantId,
          tasks: draft.tasks.map(task => ({
            id: task.id ?? this.newId(),
            title: task.title,
            isComplete: task.isComplete,
            assistantId: task.assistantId,
            assistantName: null
          }))
        };
        this.replace(this.state.stories, id, updated);
        return this.json(route, 200, this.storyView(updated));
      }
      if (storyMatch && method === 'DELETE') {
        const id = storyMatch[1];
        if (!this.state.stories.some(item => item.id === id)) return this.notFound(route, 'Story');
        this.remove(this.state.stories, id);
        return this.empty(route);
      }

      if (method === 'GET' && path === '/api/sprints/active/board') {
        return this.json(route, 200, this.activeBoard());
      }
      if (path === '/api/sprints' && method === 'GET') {
        return this.json(route, 200, this.state.sprints.map(sprint => this.sprintView(sprint)));
      }
      if (path === '/api/sprints' && method === 'POST') {
        const draft = this.body<SprintDraft>(route);
        const sprint: Sprint = {
          id: this.newId(),
          ...draft,
          endDate: this.endDate(draft.startDate),
          status: 'planned',
          storyCount: 0,
          storyKeys: []
        };
        this.state.sprints.push(sprint);
        return this.json(route, 201, this.sprintView(sprint));
      }

      const sprintStoryMatch = path.match(/^\/api\/sprints\/([^/]+)\/stories\/([^/]+)$/);
      if (sprintStoryMatch && (method === 'PUT' || method === 'DELETE')) {
        const sprintId = sprintStoryMatch[1];
        const storyId = sprintStoryMatch[2];
        if (!this.state.sprints.some(sprint => sprint.id === sprintId)) return this.notFound(route, 'Sprint');
        const story = this.state.stories.find(item => item.id === storyId);
        if (!story) return this.notFound(route, 'Story');
        const updated: Story = {
          ...story,
          sprintId: method === 'PUT' ? sprintId : null,
          boardStatus: 'toDo'
        };
        this.replace(this.state.stories, storyId, updated);
        return this.empty(route);
      }

      const sprintActionMatch = path.match(/^\/api\/sprints\/([^/]+)\/(start|complete)$/);
      if (sprintActionMatch && method === 'POST') {
        const id = sprintActionMatch[1];
        const action = sprintActionMatch[2];
        const sprint = this.state.sprints.find(item => item.id === id);
        if (!sprint) return this.notFound(route, 'Sprint');
        if (action === 'start') {
          if (this.state.sprints.some(item => item.status === 'active' && item.id !== id)) {
            return this.problem(route, 409, 'An active sprint already exists', 'Complete the active sprint before starting another one.');
          }
          const updated: Sprint = { ...sprint, status: 'active' };
          this.replace(this.state.sprints, id, updated);
          return this.json(route, 200, this.sprintView(updated));
        }

        const updated: Sprint = { ...sprint, status: 'completed' };
        this.replace(this.state.sprints, id, updated);
        for (const story of this.state.stories.filter(item => item.sprintId === id && item.boardStatus !== 'done')) {
          this.replace(this.state.stories, story.id, { ...story, sprintId: null, boardStatus: 'toDo' });
        }
        return this.json(route, 200, this.sprintView(updated));
      }

      const sprintMatch = path.match(/^\/api\/sprints\/([^/]+)$/);
      if (sprintMatch && method === 'GET') {
        const sprint = this.state.sprints.find(item => item.id === sprintMatch[1]);
        return sprint ? this.json(route, 200, this.sprintView(sprint)) : this.notFound(route, 'Sprint');
      }
      if (sprintMatch && method === 'PUT') {
        const id = sprintMatch[1];
        const sprint = this.state.sprints.find(item => item.id === id);
        if (!sprint) return this.notFound(route, 'Sprint');
        const draft = this.body<SprintDraft>(route);
        const updated: Sprint = { ...sprint, ...draft, endDate: this.endDate(draft.startDate) };
        this.replace(this.state.sprints, id, updated);
        return this.json(route, 200, this.sprintView(updated));
      }
      if (sprintMatch && method === 'DELETE') {
        const id = sprintMatch[1];
        if (!this.state.sprints.some(item => item.id === id)) return this.notFound(route, 'Sprint');
        for (const story of this.state.stories.filter(item => item.sprintId === id)) {
          this.replace(this.state.stories, story.id, { ...story, sprintId: null, boardStatus: 'toDo' });
        }
        this.remove(this.state.sprints, id);
        return this.empty(route);
      }

      this.unexpectedRequests.push(`${method} ${path}`);
      return this.problem(route, 501, 'Unhandled mock API request', `${method} ${path} has no E2E mock handler.`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'The mock API could not process the request.';
      return this.problem(route, 500, 'Mock API failure', detail);
    }
  }

  private hierarchy(): Hierarchy {
    return {
      initiatives: this.state.initiatives.map(initiative => {
        const epics = this.state.epics.filter(epic => epic.initiativeId === initiative.id);
        const stories = this.state.stories.filter(story => epics.some(epic => epic.id === story.epicId));
        return {
          ...initiative,
          epicCount: epics.length,
          storyCount: stories.length,
          epics: epics.map(epic => {
            const epicStories = stories.filter(story => story.epicId === epic.id);
            const completed = epicStories.filter(story => story.boardStatus === 'done').length;
            return {
              id: epic.id,
              name: epic.name,
              summary: epic.summary,
              storyCount: epicStories.length,
              completionPercentage: epicStories.length === 0 ? 0 : Math.round(completed / epicStories.length * 100)
            };
          })
        };
      })
    };
  }

  private assistantView(assistant: Assistant): Assistant {
    const blockingAssignments = this.blockingAssignments(assistant.id);
    return {
      ...assistant,
      storyCount: this.state.stories.filter(story => story.assistantId === assistant.id).length,
      incompleteTaskCount: this.state.stories.flatMap(story => story.tasks)
        .filter(task => task.assistantId === assistant.id && !task.isComplete).length,
      blockingAssignments
    };
  }

  private blockingAssignments(assistantId: string): AssignmentLink[] {
    const assignments: AssignmentLink[] = [];
    for (const story of this.state.stories) {
      if (story.assistantId === assistantId) {
        assignments.push({ storyId: story.id, storyKey: story.key, taskId: null, label: story.title });
      }
      for (const task of story.tasks.filter(item => item.assistantId === assistantId && !item.isComplete)) {
        assignments.push({ storyId: story.id, storyKey: story.key, taskId: task.id, label: task.title });
      }
    }
    return assignments;
  }

  private storyView(story: Story): Story {
    const epic = this.state.epics.find(item => item.id === story.epicId);
    const initiative = this.state.initiatives.find(item => item.id === epic?.initiativeId);
    const assistant = this.state.assistants.find(item => item.id === story.assistantId);
    const sprint = this.state.sprints.find(item => item.id === story.sprintId);
    return {
      ...story,
      epicName: epic?.name ?? '',
      initiativeName: initiative?.name ?? '',
      assistantName: assistant?.fullName ?? null,
      sprintName: sprint?.name ?? null,
      sprintStatus: sprint?.status ?? null,
      tasks: story.tasks.map(task => ({
        ...task,
        assistantName: this.state.assistants.find(item => item.id === task.assistantId)?.fullName ?? null
      }))
    };
  }

  private sprintView(sprint: Sprint): Sprint {
    const stories = this.state.stories.filter(story => story.sprintId === sprint.id);
    return { ...sprint, storyCount: stories.length, storyKeys: stories.map(story => story.key) };
  }

  private activeBoard(): ActiveSprintBoard | null {
    const sprint = this.state.sprints.find(item => item.status === 'active');
    if (!sprint) return null;
    const stories = this.state.stories.filter(story => story.sprintId === sprint.id).map(story => this.storyView(story));
    const doneCount = stories.filter(story => story.boardStatus === 'done').length;
    return {
      sprintId: sprint.id,
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      doneCount,
      totalCount: stories.length,
      completionPercentage: stories.length === 0 ? 0 : Math.round(doneCount / stories.length * 100),
      stories: stories.map(story => ({
        storyId: story.id,
        key: story.key,
        title: story.title,
        epicName: story.epicName,
        points: story.points,
        assistantId: story.assistantId,
        assistantName: story.assistantName,
        completedTasks: story.tasks.filter(task => task.isComplete).length,
        totalTasks: story.tasks.length,
        boardStatus: story.boardStatus
      }))
    };
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
    const index = items.findIndex(candidate => candidate.id === id);
    if (index >= 0) items[index] = item;
  }

  private remove<T extends { readonly id: string }>(items: T[], id: string): void {
    const index = items.findIndex(candidate => candidate.id === id);
    if (index >= 0) items.splice(index, 1);
  }

  private async json(route: Route, status: number, value: unknown): Promise<void> {
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
  }

  private async empty(route: Route): Promise<void> {
    await route.fulfill({ status: 204, body: '' });
  }

  private async notFound(route: Route, resource: string): Promise<void> {
    await this.problem(route, 404, `${resource} not found`, `The requested ${resource.toLowerCase()} does not exist.`);
  }

  private async problem(route: Route, status: number, title: string, detail: string, context?: unknown): Promise<void> {
    await route.fulfill({
      status,
      contentType: 'application/problem+json',
      body: JSON.stringify({ type: 'about:blank', title, status, detail, ...(context === undefined ? {} : { context }) })
    });
  }
}
