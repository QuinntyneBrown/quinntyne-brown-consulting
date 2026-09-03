using MediatR;

namespace Qbc.Workboard.Application;

public sealed record SaveInitiativeCommand(Guid? Id, string Name, string Description) : IRequest<InitiativeDto>, IValidatableRequest
{
    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(Name)) errors["name"] = ["Name is required."];
        if (string.IsNullOrWhiteSpace(Description)) errors["description"] = ["Description is required."];
        return errors;
    }
}

