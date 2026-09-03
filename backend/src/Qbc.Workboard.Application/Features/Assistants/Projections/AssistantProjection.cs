
namespace Qbc.Workboard.Application.Features.Assistants.Projections;

public static class AssistantProjection
{
    public static AssistantDto Create(Assistant assistant, IReadOnlyList<Story> stories, IReadOnlyList<StoryTask> tasks)
    {
        var ownedStories = stories.Where(story => story.AssistantId == assistant.Id && story.Lifecycle != StoryLifecycle.Archived).ToList();
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
            ownedStories.Count,
            assignedTasks.Count(task => !task.IsComplete),
            links);
    }
}

