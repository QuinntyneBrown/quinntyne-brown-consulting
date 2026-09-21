using MediatR;

namespace Qbc.Workboard.Application.Features.TimeEntries.Commands;

/// <summary>One total across several stories, recorded as one ordinary time entry per story.</summary>
public sealed record LogTimeEntryBatchCommand(
    IReadOnlyList<Guid> StoryIds,
    Guid AssistantId,
    DateOnly? WorkedOn,
    decimal TotalHours,
    string Note) : IRequest<IReadOnlyList<TimeEntryDto>>, IValidatableRequest
{
    private const decimal MaximumHours = 24m;

    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        var storyIds = StoryIds ?? [];
        if (storyIds.Count == 0) errors["storyIds"] = ["Choose at least one story."];
        else if (storyIds.Distinct().Count() != storyIds.Count) errors["storyIds"] = ["A story can only be chosen once."];
        else if (storyIds.Any(id => id == Guid.Empty)) errors["storyIds"] = ["Every story is required."];
        if (AssistantId == Guid.Empty) errors["assistantId"] = ["Assistant is required."];
        if (WorkedOn is null) errors["workedOn"] = ["A date worked is required."];
        if (TotalHours <= 0 || TotalHours > MaximumHours || TotalHours % HoursSplitter.Increment != 0)
        {
            errors["totalHours"] = ["Total hours must be greater than zero, no more than 24, and in quarter-hour increments."];
        }
        else if (storyIds.Count > 0 && TotalHours < HoursSplitter.Increment * storyIds.Count)
        {
            errors["totalHours"] = [$"Total hours must give each of the {storyIds.Count} stories at least a quarter hour."];
        }

        return errors;
    }
}
