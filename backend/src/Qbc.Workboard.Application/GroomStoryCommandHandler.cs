using MediatR;

namespace Qbc.Workboard.Application;

public sealed class GroomStoryCommandHandler : IRequestHandler<GroomStoryCommand, StoryDto>
{
    private readonly IWorkboardDbContext _db;
    private readonly StoryReadinessPolicy _policy;

    public GroomStoryCommandHandler(IWorkboardDbContext db, StoryReadinessPolicy policy)
    {
        _db = db;
        _policy = policy;
    }

    public async Task<StoryDto> Handle(GroomStoryCommand request, CancellationToken cancellationToken)
    {
        var story = _db.Stories.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Story", request.Id);
        var errors = _policy.Evaluate(story, _db.Epics.Any(item => item.Id == story.EpicId));
        if (errors.Count > 0) throw new RequestValidationException(errors);
        story.MarkReady();
        await _db.SaveChangesAsync(cancellationToken);
        return Project(story);
    }

    private StoryDto Project(Qbc.Workboard.Domain.Story story) => StoryProjection.Create(
        story, _db.Epics.ToList(), _db.Initiatives.ToList(), _db.Assistants.ToList(), _db.Sprints.ToList(), _db.StoryTasks.ToList());
}

