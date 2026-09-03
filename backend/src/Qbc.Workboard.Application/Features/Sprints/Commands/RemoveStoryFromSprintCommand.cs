using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Commands;

public sealed record RemoveStoryFromSprintCommand(Guid SprintId, Guid StoryId) : IRequest<StoryDto>;

