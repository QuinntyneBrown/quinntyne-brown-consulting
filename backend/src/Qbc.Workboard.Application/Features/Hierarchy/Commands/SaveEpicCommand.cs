using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Commands;

public sealed record SaveEpicCommand(Guid? Id, Guid InitiativeId, string Name, string Summary) : IRequest<EpicDto>, IValidatableRequest
{
    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (InitiativeId == Guid.Empty) errors["initiativeId"] = ["Initiative is required."];
        if (string.IsNullOrWhiteSpace(Name)) errors["name"] = ["Name is required."];
        if (string.IsNullOrWhiteSpace(Summary)) errors["summary"] = ["Summary is required."];
        return errors;
    }
}

