using MediatR;

namespace Qbc.Workboard.Application;

public sealed record DeleteInitiativeCommand(Guid Id) : IRequest;

