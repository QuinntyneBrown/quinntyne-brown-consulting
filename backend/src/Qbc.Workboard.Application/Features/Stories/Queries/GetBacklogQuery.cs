using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Queries;

public sealed record GetBacklogQuery : IRequest<IReadOnlyList<StoryDto>>;

