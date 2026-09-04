using MediatR;

namespace Qbc.Workboard.Application.Features.TimeEntries.Commands;

public sealed record SaveTimeEntryCommand(
    Guid? Id,
    Guid StoryId,
    Guid AssistantId,
    DateOnly? WorkedOn,
    decimal Hours,
    string Note) : IRequest<TimeEntryDto>, IValidatableRequest
{
    /// <summary>The increment the product records time in, which the form offers and the API enforces.</summary>
    private const decimal Increment = 0.25m;
    private const decimal MaximumHours = 24m;

    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (StoryId == Guid.Empty) errors["storyId"] = ["Story is required."];
        if (AssistantId == Guid.Empty) errors["assistantId"] = ["Assistant is required."];
        if (WorkedOn is null) errors["workedOn"] = ["A date worked is required."];
        if (Hours <= 0 || Hours > MaximumHours || Hours % Increment != 0)
        {
            errors["hours"] = ["Hours must be greater than zero, no more than 24, and in quarter-hour increments."];
        }

        return errors;
    }
}
