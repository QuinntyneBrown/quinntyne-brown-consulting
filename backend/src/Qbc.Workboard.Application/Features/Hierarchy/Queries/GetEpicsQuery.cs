using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Queries;

public sealed record GetEpicsQuery(Guid? InitiativeId) : IRequest<IReadOnlyList<EpicDto>>;

