using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Queries;

public sealed record GetInitiativeQuery(Guid Id) : IRequest<InitiativeDto>;

