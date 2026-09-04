import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { FEEDBACK_SERVICE } from './core/feedback.service.contract';
import { FeedbackService } from './core/feedback.service';
import { SESSION_SERVICE } from './core/session.service.contract';
import { SessionService } from './core/session.service';
import { VERSION_SERVICE } from './core/version.service.contract';
import { VersionService } from './core/version.service';
import { WORKSPACE_SERVICE } from './core/workspace.service.contract';
import { WorkspaceService } from './core/workspace.service';
import { ASSISTANT_HOURS_SERVICE } from './features/assistant-hours/assistant-hours.service.contract';
import { AssistantHoursService } from './features/assistant-hours/assistant-hours.service';
import { ASSISTANT_SERVICE } from './features/assistants/assistant.service.contract';
import { AssistantService } from './features/assistants/assistant.service';
import { BACKLOG_SERVICE } from './features/backlog/backlog.service.contract';
import { BacklogService } from './features/backlog/backlog.service';
import { SPRINT_EXECUTION_SERVICE } from './features/board/sprint-execution.service.contract';
import { SprintExecutionService } from './features/board/sprint-execution.service';
import { HIERARCHY_SERVICE } from './features/hierarchy/hierarchy.service.contract';
import { EPIC_SUMMARY_SERVICE } from './features/epic-summary/epic-summary.service.contract';
import { EpicSummaryService } from './features/epic-summary/epic-summary.service';
import { INITIATIVE_BRIEF_SERVICE } from './features/initiative-brief/initiative-brief.service.contract';
import { InitiativeBriefService } from './features/initiative-brief/initiative-brief.service';
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
    { provide: VERSION_SERVICE, useExisting: VersionService },
    { provide: WORKSPACE_SERVICE, useExisting: WorkspaceService },
    { provide: SESSION_SERVICE, useExisting: SessionService },
    { provide: HIERARCHY_SERVICE, useExisting: HierarchyService },
    { provide: INITIATIVE_BRIEF_SERVICE, useExisting: InitiativeBriefService },
    { provide: EPIC_SUMMARY_SERVICE, useExisting: EpicSummaryService },
    { provide: ASSISTANT_SERVICE, useExisting: AssistantService },
    { provide: ASSISTANT_HOURS_SERVICE, useExisting: AssistantHoursService },
    { provide: STORY_SERVICE, useExisting: StoryService },
    { provide: STORY_EDITOR_SERVICE, useExisting: StoryEditorService },
    { provide: BACKLOG_SERVICE, useExisting: BacklogService },
    { provide: SPRINT_PLANNING_SERVICE, useExisting: SprintPlanningService },
    { provide: SPRINT_EXECUTION_SERVICE, useExisting: SprintExecutionService },
  ]);
}
