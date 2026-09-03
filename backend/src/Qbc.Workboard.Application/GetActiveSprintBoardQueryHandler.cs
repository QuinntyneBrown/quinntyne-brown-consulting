using MediatR;
using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed class GetActiveSprintBoardQueryHandler : IRequestHandler<GetActiveSprintBoardQuery, ActiveSprintBoardDto?>
{
    private readonly IWorkboardDbContext _db;

    public GetActiveSprintBoardQueryHandler(IWorkboardDbContext db) => _db = db;

    public Task<ActiveSprintBoardDto?> Handle(GetActiveSprintBoardQuery request, CancellationToken cancellationToken)
    {
        var sprint = _db.Sprints.SingleOrDefault(item => item.Status == SprintStatus.Active);
        if (sprint is null) return Task.FromResult<ActiveSprintBoardDto?>(null);
        var epics = _db.Epics.ToList();
        var assistants = _db.Assistants.ToList();
        var tasks = _db.StoryTasks.ToList();
        var stories = _db.Stories.Where(item => item.SprintId == sprint.Id && item.Lifecycle != StoryLifecycle.Archived).OrderBy(item => item.Number).ToList();
        var cards = stories.Select(story =>
        {
            var storyTasks = tasks.Where(item => item.StoryId == story.Id).ToList();
            return new SprintStoryCardDto(
                story.Id,
                story.Key,
                story.Title,
                epics.Single(item => item.Id == story.EpicId).Name,
                story.Points,
                story.AssistantId,
                assistants.SingleOrDefault(item => item.Id == story.AssistantId)?.FullName,
                storyTasks.Count(item => item.IsComplete),
                storyTasks.Count,
                story.BoardStatus);
        }).ToList();
        var done = cards.Count(item => item.BoardStatus == BoardStatus.Done);
        var percentage = cards.Count == 0 ? 0 : (int)Math.Round(done * 100m / cards.Count);
        return Task.FromResult<ActiveSprintBoardDto?>(new ActiveSprintBoardDto(
            sprint.Id, sprint.Name, sprint.Goal, sprint.StartDate, sprint.EndDate, done, cards.Count, percentage, cards));
    }
}

