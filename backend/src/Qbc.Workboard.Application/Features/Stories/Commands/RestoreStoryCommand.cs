using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed record RestoreStoryCommand(Guid Id) : IRequest<StoryDto>;

