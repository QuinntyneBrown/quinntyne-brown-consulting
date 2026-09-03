using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetStoryQuery(Guid Id) : IRequest<StoryDto>;

