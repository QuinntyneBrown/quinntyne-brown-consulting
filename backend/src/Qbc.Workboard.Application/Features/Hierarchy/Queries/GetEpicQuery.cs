using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Queries;

public sealed record GetEpicQuery(Guid Id) : IRequest<EpicDto>;

