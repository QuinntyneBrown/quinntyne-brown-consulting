using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Commands;

public sealed record AssignStoryToSprintCommand(Guid SprintId, Guid StoryId) : IRequest<StoryDto>;

