using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetBacklogQuery : IRequest<IReadOnlyList<StoryDto>>;

