using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Commands;

public sealed record SaveEpicCommand(Guid? Id, Guid InitiativeId, string Name, string Summary) : IRequest<EpicDto>, IValidatableRequest
{
    /// <summary>
    /// The summary carries the epic's own markdown document, so it is bounded rather than unlimited.
    /// The bound matches the initiative brief: generous enough for a long summary and small enough
    /// that one record cannot fill a request body on its own.
    /// </summary>
    private const int MaxSummaryLength = 100_000;

    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (InitiativeId == Guid.Empty) errors["initiativeId"] = ["Initiative is required."];
        if (string.IsNullOrWhiteSpace(Name)) errors["name"] = ["Name is required."];
        if (string.IsNullOrWhiteSpace(Summary)) errors["summary"] = ["Summary is required."];
        else if (Summary.Length > MaxSummaryLength)
            errors["summary"] = [$"Summary must be {MaxSummaryLength:N0} characters or fewer."];
        return errors;
    }
}
