using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetSprintsQuery : IRequest<IReadOnlyList<SprintDto>>;

