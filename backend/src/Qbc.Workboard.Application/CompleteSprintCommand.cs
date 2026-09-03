using MediatR;

namespace Qbc.Workboard.Application;

public sealed record CompleteSprintCommand(Guid Id) : IRequest<SprintDto>;

