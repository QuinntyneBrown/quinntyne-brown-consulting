using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed record GroomStoryCommand(Guid Id) : IRequest<StoryDto>;

