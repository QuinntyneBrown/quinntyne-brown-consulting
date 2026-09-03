using MediatR;

namespace Qbc.Workboard.Application;

public sealed class GetBacklogQueryHandler : IRequestHandler<GetBacklogQuery, IReadOnlyList<StoryDto>>
{
    private readonly IWorkboardDbContext _db;

    public GetBacklogQueryHandler(IWorkboardDbContext db) => _db = db;

    public Task<IReadOnlyList<StoryDto>> Handle(GetBacklogQuery request, CancellationToken cancellationToken)
    {
        var epics = _db.Epics.ToList();
        var initiatives = _db.Initiatives.ToList();
        var assistants = _db.Assistants.ToList();
        var sprints = _db.Sprints.ToList();
        var tasks = _db.StoryTasks.ToList();
        IReadOnlyList<StoryDto> result = _db.Stories.OrderBy(item => item.Number).ToList()
            .Select(story => StoryProjection.Create(story, epics, initiatives, assistants, sprints, tasks)).ToList();
        return Task.FromResult(result);
    }
}

