using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Commands;

public sealed record CompleteSprintCommand(Guid Id) : IRequest<SprintDto>;

