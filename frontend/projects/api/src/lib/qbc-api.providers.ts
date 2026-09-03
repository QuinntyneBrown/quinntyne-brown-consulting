import { provideHttpClient } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AssistantApi } from './assistants/assistant-api';
import { ASSISTANT_API } from './assistants/assistant-api.token';
import { HierarchyApi } from './hierarchy/hierarchy-api';
import { HIERARCHY_API } from './hierarchy/hierarchy-api.token';
import { SprintApi } from './sprints/sprint-api';
import { SPRINT_API } from './sprints/sprint-api.token';
import { StoryApi } from './stories/story-api';
import { STORY_API } from './stories/story-api.token';
import { WorkspaceApi } from './workspace/workspace-api';
import { WORKSPACE_API } from './workspace/workspace-api.token';

export function provideQbcApi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(),
    AssistantApi,
    HierarchyApi,
    SprintApi,
    StoryApi,
    WorkspaceApi,
    { provide: ASSISTANT_API, useExisting: AssistantApi },
    { provide: HIERARCHY_API, useExisting: HierarchyApi },
    { provide: SPRINT_API, useExisting: SprintApi },
    { provide: STORY_API, useExisting: StoryApi },
    { provide: WORKSPACE_API, useExisting: WorkspaceApi }
  ]);
}
