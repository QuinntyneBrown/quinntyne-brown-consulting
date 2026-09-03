using MediatR;
using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed class MoveStoryCommandHandler : IRequestHandler<MoveStoryCommand, StoryDto>
{
    private readonly IWorkboardDbContext _db;

    public MoveStoryCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<StoryDto> Handle(MoveStoryCommand request, CancellationToken cancellationToken)
    {
        var story = _db.Stories.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Story", request.Id);
        if (story.SprintId is null || !_db.Sprints.Any(item => item.Id == story.SprintId && item.Status == SprintStatus.Active))
            throw new ConflictException("Only stories in the active sprint can move on the board.");
        story.MoveTo(request.Status);
        await _db.SaveChangesAsync(cancellationToken);
        return StoryProjection.Create(story, _db.Epics.ToList(), _db.Initiatives.ToList(), _db.Assistants.ToList(), _db.Sprints.ToList(), _db.StoryTasks.ToList());
    }
}

