using MediatR;

namespace Qbc.Workboard.Application;

public sealed record MarkStoryUnreadyCommand(Guid Id) : IRequest<StoryDto>;

