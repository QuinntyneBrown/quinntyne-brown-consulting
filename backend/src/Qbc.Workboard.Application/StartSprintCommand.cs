using MediatR;

namespace Qbc.Workboard.Application;

public sealed record StartSprintCommand(Guid Id) : IRequest<SprintDto>;

