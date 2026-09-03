using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Commands;

public sealed record DeleteSprintCommand(Guid Id) : IRequest;

