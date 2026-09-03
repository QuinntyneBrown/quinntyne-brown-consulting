using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Queries;

public sealed record GetInitiativesQuery : IRequest<IReadOnlyList<InitiativeDto>>;

