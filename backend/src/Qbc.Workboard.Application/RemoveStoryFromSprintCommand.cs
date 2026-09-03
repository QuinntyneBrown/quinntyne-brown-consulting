using MediatR;

namespace Qbc.Workboard.Application;

public sealed record RemoveStoryFromSprintCommand(Guid SprintId, Guid StoryId) : IRequest<StoryDto>;

