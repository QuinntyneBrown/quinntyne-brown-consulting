using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public static class StoryProjection
{
    public static StoryDto Create(
        Story story,
        IReadOnlyList<Epic> epics,
        IReadOnlyList<Initiative> initiatives,
        IReadOnlyList<Assistant> assistants,
        IReadOnlyList<Sprint> sprints,
        IReadOnlyList<StoryTask> tasks)
    {
        var epic = epics.Single(item => item.Id == story.EpicId);
        var initiative = initiatives.Single(item => item.Id == epic.InitiativeId);
        var sprint = story.SprintId is null ? null : sprints.SingleOrDefault(item => item.Id == story.SprintId);
        var owner = story.AssistantId is null ? null : assistants.SingleOrDefault(item => item.Id == story.AssistantId);
        var taskDtos = tasks.Where(item => item.StoryId == story.Id).Select(task =>
        {
            var assignee = task.AssistantId is null ? null : assistants.SingleOrDefault(item => item.Id == task.AssistantId);
            return new StoryTaskDto(task.Id, task.Title, task.IsComplete, task.AssistantId, assignee?.FullName);
        }).ToList();
        return new StoryDto(
            story.Id,
            story.Key,
            story.EpicId,
            epic.Name,
            initiative.Name,
            story.Title,
            story.Description,
            story.AcceptanceCriteria,
            story.Points,
            story.AssistantId,
            owner?.FullName,
            story.Lifecycle,
            story.IsReady,
            story.SprintId,
            sprint?.Name,
            sprint?.Status,
            story.BoardStatus,
            taskDtos);
    }
}

