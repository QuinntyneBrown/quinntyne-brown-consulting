using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Queries;

public sealed record GetSprintQuery(Guid Id) : IRequest<SprintDto>;

