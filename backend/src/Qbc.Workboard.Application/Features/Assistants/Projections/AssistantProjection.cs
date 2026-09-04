
namespace Qbc.Workboard.Application.Features.Assistants.Projections;

public static class AssistantProjection
{
    public static AssistantDto Create(Assistant assistant, IReadOnlyList<Story> stories, IReadOnlyList<StoryTask> tasks)
    {
        // Deleting an assistant must not orphan work, so every owned story blocks it. The workload
        // counts describe current work instead, which is why archived stories are excluded there.
        var ownedStories = stories.Where(story => story.AssistantId == assistant.Id).ToList();
        var currentStories = ownedStories.Where(story => story.Lifecycle != StoryLifecycle.Archived).ToList();
        var assignedTasks = tasks.Where(task => task.AssistantId == assistant.Id).ToList();
        var links = ownedStories.Select(story => new AssignmentLinkDto(story.Id, story.Key, null, story.Title))
            .Concat(assignedTasks.Select(task =>
            {
                var story = stories.Single(item => item.Id == task.StoryId);
                return new AssignmentLinkDto(story.Id, story.Key, task.Id, task.Title);
            })).ToList();
        return new AssistantDto(
            assistant.Id,
            assistant.FullName,
            assistant.Role,
            assistant.Specialties,
            assistant.Availability,
            currentStories.Count,
            assignedTasks.Count(task => !task.IsComplete),
            links);
    }
}

