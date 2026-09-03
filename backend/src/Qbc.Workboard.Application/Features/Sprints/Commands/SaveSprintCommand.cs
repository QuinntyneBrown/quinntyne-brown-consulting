using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Commands;

public sealed record SaveSprintCommand(Guid? Id, string Name, string Goal, DateOnly StartDate) : IRequest<SprintDto>, IValidatableRequest
{
    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(Name)) errors["name"] = ["Name is required."];
        if (string.IsNullOrWhiteSpace(Goal)) errors["goal"] = ["Goal is required."];
        if (StartDate == default) errors["startDate"] = ["A valid start date is required."];
        return errors;
    }
}

