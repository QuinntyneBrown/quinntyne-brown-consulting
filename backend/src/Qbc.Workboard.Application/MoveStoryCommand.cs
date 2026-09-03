using MediatR;
using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed record MoveStoryCommand(Guid Id, BoardStatus Status) : IRequest<StoryDto>;

