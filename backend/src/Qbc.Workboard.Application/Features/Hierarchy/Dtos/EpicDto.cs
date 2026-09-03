namespace Qbc.Workboard.Application.Features.Hierarchy.Dtos;

public sealed record EpicDto(Guid Id, Guid InitiativeId, string Name, string Summary);

