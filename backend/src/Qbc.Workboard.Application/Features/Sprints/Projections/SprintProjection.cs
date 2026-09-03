
namespace Qbc.Workboard.Application.Features.Sprints.Projections;

public static class SprintProjection
{
    public static SprintDto Create(Sprint sprint, IReadOnlyList<Story> stories)
    {
        var members = stories.Where(item => item.SprintId == sprint.Id).OrderBy(item => item.Number).ToList();
        return new SprintDto(sprint.Id, sprint.Name, sprint.Goal, sprint.StartDate, sprint.EndDate, sprint.Status, members.Count, members.Select(item => item.Key).ToList());
    }
}

