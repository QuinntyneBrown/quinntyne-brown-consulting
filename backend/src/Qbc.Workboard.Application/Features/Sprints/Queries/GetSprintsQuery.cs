using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Queries;

public sealed record GetSprintsQuery : IRequest<IReadOnlyList<SprintDto>>;

