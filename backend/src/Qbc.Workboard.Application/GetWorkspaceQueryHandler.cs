using MediatR;
using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed class GetWorkspaceQueryHandler : IRequestHandler<GetWorkspaceQuery, WorkspaceBootstrapDto>
{
    private static readonly HashSet<string> Routes = new(StringComparer.OrdinalIgnoreCase)
    {
        "board", "backlog", "initiatives", "assistants"
    };

    private readonly IWorkboardDbContext _db;

    public GetWorkspaceQueryHandler(IWorkboardDbContext db)
    {
        _db = db;
    }

    public Task<WorkspaceBootstrapDto> Handle(GetWorkspaceQuery request, CancellationToken cancellationToken)
    {
        var route = Routes.Contains(request.Route) ? request.Route.ToLowerInvariant() : "board";
        var hasActiveSprint = _db.Sprints.Any(sprint => sprint.Status == SprintStatus.Active);
        var backlogCount = _db.Stories.Count(story => story.SprintId == null);
        return Task.FromResult(new WorkspaceBootstrapDto(route, hasActiveSprint, backlogCount));
    }
}
