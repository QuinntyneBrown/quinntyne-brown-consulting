using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetEpicsQuery(Guid? InitiativeId) : IRequest<IReadOnlyList<EpicDto>>;

