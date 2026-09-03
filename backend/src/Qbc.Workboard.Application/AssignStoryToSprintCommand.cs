using MediatR;

namespace Qbc.Workboard.Application;

public sealed record AssignStoryToSprintCommand(Guid SprintId, Guid StoryId) : IRequest<StoryDto>;

