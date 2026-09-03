using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed class ArchiveStoryCommandHandler : IRequestHandler<ArchiveStoryCommand, StoryDto>
{
    private readonly IWorkboardDbContext _db;

    public ArchiveStoryCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<StoryDto> Handle(ArchiveStoryCommand request, CancellationToken cancellationToken)
    {
        var story = _db.Stories.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Story", request.Id);
        if (story.SprintId is not null && _db.Sprints.Any(item => item.Id == story.SprintId && item.Status == SprintStatus.Completed))
            throw new ConflictException("Completed sprint history cannot be archived.");
        story.Archive();
        await _db.SaveChangesAsync(cancellationToken);
        return Project(story);
    }

    private StoryDto Project(Story story) => StoryProjection.Create(story, _db.Epics.ToList(), _db.Initiatives.ToList(), _db.Assistants.ToList(), _db.Sprints.ToList(), _db.StoryTasks.ToList());
}

