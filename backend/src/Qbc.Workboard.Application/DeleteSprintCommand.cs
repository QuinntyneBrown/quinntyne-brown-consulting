using MediatR;

namespace Qbc.Workboard.Application;

public sealed record DeleteSprintCommand(Guid Id) : IRequest;

