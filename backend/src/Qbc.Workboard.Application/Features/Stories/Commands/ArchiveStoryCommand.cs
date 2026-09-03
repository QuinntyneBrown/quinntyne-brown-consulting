using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed record ArchiveStoryCommand(Guid Id) : IRequest<StoryDto>;

