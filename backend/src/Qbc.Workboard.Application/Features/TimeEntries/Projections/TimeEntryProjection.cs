
namespace Qbc.Workboard.Application.Features.TimeEntries.Projections;

public static class TimeEntryProjection
{
    public static TimeEntryDto Create(TimeEntry entry, IReadOnlyList<Story> stories, IReadOnlyList<Assistant> assistants)
    {
        var story = stories.Single(item => item.Id == entry.StoryId);
        var assistant = assistants.Single(item => item.Id == entry.AssistantId);
        return new TimeEntryDto(
            entry.Id,
            entry.StoryId,
            story.Key,
            entry.AssistantId,
            assistant.FullName,
            entry.WorkedOn,
            entry.Hours,
            entry.Note);
    }
}
