using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Queries;

public sealed record GetStoryQuery(Guid Id) : IRequest<StoryDto>;

