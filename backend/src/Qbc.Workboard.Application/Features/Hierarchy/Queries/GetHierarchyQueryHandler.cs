using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Queries;

public sealed class GetHierarchyQueryHandler : IRequestHandler<GetHierarchyQuery, HierarchyDto>
{
    private readonly IWorkboardDbContext _db;

    public GetHierarchyQueryHandler(IWorkboardDbContext db)
    {
        _db = db;
    }

    public Task<HierarchyDto> Handle(GetHierarchyQuery request, CancellationToken cancellationToken)
    {
        var initiatives = _db.Initiatives.OrderBy(item => item.Name).ToList();
        var epics = _db.Epics.OrderBy(item => item.Name).ToList();
        var stories = _db.Stories.ToList();
        var result = initiatives.Select(initiative =>
        {
            var initiativeEpics = epics.Where(epic => epic.InitiativeId == initiative.Id).Select(epic =>
            {
                var epicStories = stories.Where(story => story.EpicId == epic.Id).ToList();
                var percentage = epicStories.Count == 0 ? 0 : (int)Math.Round(epicStories.Count(story => story.BoardStatus == BoardStatus.Done) * 100m / epicStories.Count);
                return new EpicHierarchyDto(epic.Id, epic.Name, epic.Summary, epicStories.Count, percentage);
            }).ToList();
            return new InitiativeHierarchyDto(
                initiative.Id,
                initiative.Name,
                initiative.Description,
                initiativeEpics.Count,
                initiativeEpics.Sum(epic => epic.StoryCount),
                initiativeEpics);
        }).ToList();
        return Task.FromResult(new HierarchyDto(result));
    }
}

