using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Commands;

public sealed record DeleteInitiativeCommand(Guid Id) : IRequest;

