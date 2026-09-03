using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed class MarkStoryUnreadyCommandHandler : IRequestHandler<MarkStoryUnreadyCommand, StoryDto>
{
    private readonly IWorkboardDbContext _db;

    public MarkStoryUnreadyCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<StoryDto> Handle(MarkStoryUnreadyCommand request, CancellationToken cancellationToken)
    {
        var story = _db.Stories.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Story", request.Id);
        story.MarkUnready();
        await _db.SaveChangesAsync(cancellationToken);
        return StoryProjection.Create(story, _db.Epics.ToList(), _db.Initiatives.ToList(), _db.Assistants.ToList(), _db.Sprints.ToList(), _db.StoryTasks.ToList());
    }
}

