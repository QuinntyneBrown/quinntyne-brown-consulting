using MediatR;

namespace Qbc.Workboard.Application;

public sealed record ArchiveStoryCommand(Guid Id) : IRequest<StoryDto>;

