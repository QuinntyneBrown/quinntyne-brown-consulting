using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Commands;

public sealed record SaveInitiativeCommand(Guid? Id, string Name, string Description) : IRequest<InitiativeDto>, IValidatableRequest
{
    /// <summary>
    /// The description carries the initiative's outcome brief as a markdown document, so it is bounded
    /// rather than unlimited. The bound is generous enough for a long brief and small enough that one
    /// record cannot fill a request body on its own.
    /// </summary>
    private const int MaxDescriptionLength = 100_000;

    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(Name)) errors["name"] = ["Name is required."];
        if (string.IsNullOrWhiteSpace(Description)) errors["description"] = ["Description is required."];
        else if (Description.Length > MaxDescriptionLength)
            errors["description"] = [$"Description must be {MaxDescriptionLength:N0} characters or fewer."];
        return errors;
    }
}

