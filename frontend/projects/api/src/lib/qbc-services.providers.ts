import { provideHttpClient } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AssistantService } from './assistants/assistant.service';
import { ASSISTANT_SERVICE } from './assistants/assistant.service.token';
import { HierarchyService } from './hierarchy/hierarchy.service';
import { HIERARCHY_SERVICE } from './hierarchy/hierarchy.service.token';
import { SprintService } from './sprints/sprint.service';
import { SPRINT_SERVICE } from './sprints/sprint.service.token';
import { StoryService } from './stories/story.service';
import { STORY_SERVICE } from './stories/story.service.token';
import { WorkspaceService } from './workspace/workspace.service';
import { WORKSPACE_SERVICE } from './workspace/workspace.service.token';

export function provideQbcServices(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(),
    AssistantService,
    HierarchyService,
    SprintService,
    StoryService,
    WorkspaceService,
    { provide: ASSISTANT_SERVICE, useExisting: AssistantService },
    { provide: HIERARCHY_SERVICE, useExisting: HierarchyService },
    { provide: SPRINT_SERVICE, useExisting: SprintService },
    { provide: STORY_SERVICE, useExisting: StoryService },
    { provide: WORKSPACE_SERVICE, useExisting: WorkspaceService }
  ]);
}
