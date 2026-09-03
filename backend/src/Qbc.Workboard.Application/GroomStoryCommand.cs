using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GroomStoryCommand(Guid Id) : IRequest<StoryDto>;

