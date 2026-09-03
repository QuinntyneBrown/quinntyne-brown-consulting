using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Queries;

public sealed record GetActiveSprintBoardQuery : IRequest<ActiveSprintBoardDto?>;

