using MediatR;
using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed record SaveAssistantCommand(
    Guid? Id,
    string FullName,
    string Role,
    IReadOnlyList<string> Specialties,
    Availability Availability) : IRequest<AssistantDto>, IValidatableRequest
{
    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(FullName)) errors["fullName"] = ["Full name is required."];
        if (string.IsNullOrWhiteSpace(Role)) errors["role"] = ["Role is required."];
        if (!Enum.IsDefined(Availability)) errors["availability"] = ["Availability is invalid."];
        return errors;
    }
}

