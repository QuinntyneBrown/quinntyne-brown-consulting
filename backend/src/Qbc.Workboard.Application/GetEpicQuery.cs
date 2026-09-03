using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetEpicQuery(Guid Id) : IRequest<EpicDto>;

