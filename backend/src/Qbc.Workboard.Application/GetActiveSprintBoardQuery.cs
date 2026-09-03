using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetActiveSprintBoardQuery : IRequest<ActiveSprintBoardDto?>;

