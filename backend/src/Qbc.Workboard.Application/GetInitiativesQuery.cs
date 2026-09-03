using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetInitiativesQuery : IRequest<IReadOnlyList<InitiativeDto>>;

