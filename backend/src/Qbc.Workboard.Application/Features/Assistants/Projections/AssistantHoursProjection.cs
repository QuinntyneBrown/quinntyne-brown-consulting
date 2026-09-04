
namespace Qbc.Workboard.Application.Features.Assistants.Projections;

public static class AssistantHoursProjection
{
    public static AssistantHoursDto Create(
        Assistant assistant,
        IReadOnlyList<TimeEntry> entries,
        IReadOnlyList<Story> stories,
        IReadOnlyList<Epic> epics,
        IReadOnlyList<Assistant> assistants)
    {
        // An assistant worked on a story when they logged hours against it. Story ownership is a
        // current-state pointer, so reassigning a story would otherwise erase the work they did on it.
        var own = entries.Where(entry => entry.AssistantId == assistant.Id).ToList();
        var worked = own
            .GroupBy(entry => entry.StoryId)
            .Select(group =>
            {
                var story = stories.Single(item => item.Id == group.Key);
                var epic = epics.Single(item => item.Id == story.EpicId);
                var logged = group.OrderBy(entry => entry.WorkedOn).ThenBy(entry => entry.Id).ToList();
                return new AssistantHoursStoryDto(
                    story.Id,
                    story.Key,
                    story.Title,
                    epic.Name,
                    story.BoardStatus,
                    story.BoardStatus == BoardStatus.Done,
                    story.Points,
                    logged.Sum(entry => entry.Hours),
                    entries.Where(entry => entry.StoryId == story.Id).Sum(entry => entry.Hours),
                    logged.Select(entry => TimeEntryProjection.Create(entry, stories, assistants)).ToList());
            })
            // Most recently worked first, which is the order the page reads in; the key breaks ties.
            .OrderByDescending(story => story.Entries[^1].WorkedOn)
            .ThenBy(story => story.StoryKey)
            .ToList();
        return new AssistantHoursDto(
            assistant.Id,
            assistant.FullName,
            assistant.Role,
            assistant.Specialties,
            assistant.Availability,
            own.Sum(entry => entry.Hours),
            worked.Where(story => story.IsComplete).Sum(story => story.Hours),
            worked.Count,
            worked.Count(story => story.IsComplete),
            worked);
    }
}
