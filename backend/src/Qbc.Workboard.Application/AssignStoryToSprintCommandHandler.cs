using MediatR;
using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed class AssignStoryToSprintCommandHandler : IRequestHandler<AssignStoryToSprintCommand, StoryDto>
{
    private readonly IWorkboardDbContext _db;

    public AssignStoryToSprintCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<StoryDto> Handle(AssignStoryToSprintCommand request, CancellationToken cancellationToken)
    {
        var sprint = _db.Sprints.SingleOrDefault(item => item.Id == request.SprintId) ?? throw new NotFoundException("Sprint", request.SprintId);
        if (sprint.Status == SprintStatus.Completed) throw new ConflictException("Completed sprints cannot accept stories.");
        var story = _db.Stories.SingleOrDefault(item => item.Id == request.StoryId) ?? throw new NotFoundException("Story", request.StoryId);
        if (story.SprintId is not null && _db.Sprints.Any(item => item.Id == story.SprintId && item.Status == SprintStatus.Completed))
            throw new ConflictException("Completed sprint history cannot be replanned.");
        story.AssignToSprint(sprint.Id);
        await _db.SaveChangesAsync(cancellationToken);
        return Project(story);
    }

    private StoryDto Project(Story story) => StoryProjection.Create(story, _db.Epics.ToList(), _db.Initiatives.ToList(), _db.Assistants.ToList(), _db.Sprints.ToList(), _db.StoryTasks.ToList());
}

