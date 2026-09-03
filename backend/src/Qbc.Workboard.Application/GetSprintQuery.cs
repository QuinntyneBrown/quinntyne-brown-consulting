using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetSprintQuery(Guid Id) : IRequest<SprintDto>;

