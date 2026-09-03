import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { FEEDBACK_SERVICE } from './core/feedback.service.contract';
import { FeedbackService } from './core/feedback.service';
import { WORKSPACE_SERVICE } from './core/workspace.service.contract';
import { WorkspaceService } from './core/workspace.service';
import { ASSISTANT_SERVICE } from './features/assistants/assistant.service.contract';
import { AssistantService } from './features/assistants/assistant.service';
import { BACKLOG_SERVICE } from './features/backlog/backlog.service.contract';
import { BacklogService } from './features/backlog/backlog.service';
import { SPRINT_EXECUTION_SERVICE } from './features/board/sprint-execution.service.contract';
import { SprintExecutionService } from './features/board/sprint-execution.service';
import { HIERARCHY_SERVICE } from './features/hierarchy/hierarchy.service.contract';
import { HierarchyService } from './features/hierarchy/hierarchy.service';
import { SPRINT_PLANNING_SERVICE } from './features/sprints/sprint-planning.service.contract';
import { SprintPlanningService } from './features/sprints/sprint-planning.service';
import { STORY_EDITOR_SERVICE } from './features/stories/story-editor.service.contract';
import { StoryEditorService } from './features/stories/story-editor.service';
import { STORY_SERVICE } from './features/stories/story.service.contract';
import { StoryService } from './features/stories/story.service';

export function provideQbcWorkboard(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FEEDBACK_SERVICE, useExisting: FeedbackService },
    { provide: WORKSPACE_SERVICE, useExisting: WorkspaceService },
    { provide: HIERARCHY_SERVICE, useExisting: HierarchyService },
    { provide: ASSISTANT_SERVICE, useExisting: AssistantService },
    { provide: STORY_SERVICE, useExisting: StoryService },
    { provide: STORY_EDITOR_SERVICE, useExisting: StoryEditorService },
    { provide: BACKLOG_SERVICE, useExisting: BacklogService },
    { provide: SPRINT_PLANNING_SERVICE, useExisting: SprintPlanningService },
    { provide: SPRINT_EXECUTION_SERVICE, useExisting: SprintExecutionService },
  ]);
}
