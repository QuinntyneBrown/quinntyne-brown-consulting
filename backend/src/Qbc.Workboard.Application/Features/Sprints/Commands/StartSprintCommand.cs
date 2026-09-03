using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Commands;

public sealed record StartSprintCommand(Guid Id) : IRequest<SprintDto>;

