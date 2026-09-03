using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed class RestoreStoryCommandHandler : IRequestHandler<RestoreStoryCommand, StoryDto>
{
    private readonly IWorkboardDbContext _db;

    public RestoreStoryCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<StoryDto> Handle(RestoreStoryCommand request, CancellationToken cancellationToken)
    {
        var story = _db.Stories.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Story", request.Id);
        story.RestoreAsDraft();
        await _db.SaveChangesAsync(cancellationToken);
        return StoryProjection.Create(story, _db.Epics.ToList(), _db.Initiatives.ToList(), _db.Assistants.ToList(), _db.Sprints.ToList(), _db.StoryTasks.ToList());
    }
}

