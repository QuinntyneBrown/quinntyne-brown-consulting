using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed record MoveStoryCommand(Guid Id, BoardStatus Status) : IRequest<StoryDto>;

