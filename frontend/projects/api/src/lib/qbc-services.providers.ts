import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AccessService } from './access/access.service';
import { ACCESS_SERVICE } from './access/access.service.token';
import { AccessTokenStore } from './access/access-token-store';
import { ACCESS_TOKEN_STORE } from './access/access-token-store.token';
import { accessTokenInterceptor } from './access/access-token.interceptor';
import { AssistantService } from './assistants/assistant.service';
import { ASSISTANT_SERVICE } from './assistants/assistant.service.token';
import { VersionService } from './deployment/version.service';
import { VERSION_SERVICE } from './deployment/version.service.token';
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
    provideHttpClient(withInterceptors([accessTokenInterceptor])),
    AccessService,
    AccessTokenStore,
    AssistantService,
    HierarchyService,
    SprintService,
    StoryService,
    VersionService,
    WorkspaceService,
    { provide: ACCESS_SERVICE, useExisting: AccessService },
    { provide: ACCESS_TOKEN_STORE, useExisting: AccessTokenStore },
    { provide: ASSISTANT_SERVICE, useExisting: AssistantService },
    { provide: HIERARCHY_SERVICE, useExisting: HierarchyService },
    { provide: SPRINT_SERVICE, useExisting: SprintService },
    { provide: STORY_SERVICE, useExisting: StoryService },
    { provide: VERSION_SERVICE, useExisting: VersionService },
    { provide: WORKSPACE_SERVICE, useExisting: WorkspaceService },
  ]);
}
