using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetInitiativeQuery(Guid Id) : IRequest<InitiativeDto>;

