using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed record MarkStoryUnreadyCommand(Guid Id) : IRequest<StoryDto>;

