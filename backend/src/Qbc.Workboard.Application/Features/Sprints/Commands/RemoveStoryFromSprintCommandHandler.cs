using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Commands;

public sealed class RemoveStoryFromSprintCommandHandler : IRequestHandler<RemoveStoryFromSprintCommand, StoryDto>
{
    private readonly IWorkboardDbContext _db;

    public RemoveStoryFromSprintCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<StoryDto> Handle(RemoveStoryFromSprintCommand request, CancellationToken cancellationToken)
    {
        var sprint = _db.Sprints.SingleOrDefault(item => item.Id == request.SprintId) ?? throw new NotFoundException("Sprint", request.SprintId);
        if (sprint.Status == SprintStatus.Completed) throw new ConflictException("Completed sprint membership cannot be changed.");
        var story = _db.Stories.SingleOrDefault(item => item.Id == request.StoryId) ?? throw new NotFoundException("Story", request.StoryId);
        if (story.SprintId != sprint.Id) throw new ConflictException("The story is not assigned to this sprint.");
        story.ReturnToBacklog();
        await _db.SaveChangesAsync(cancellationToken);
        return StoryProjection.Create(story, _db.Epics.ToList(), _db.Initiatives.ToList(), _db.Assistants.ToList(), _db.Sprints.ToList(), _db.StoryTasks.ToList());
    }
}

