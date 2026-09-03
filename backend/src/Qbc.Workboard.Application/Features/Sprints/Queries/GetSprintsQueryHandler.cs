using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Queries;

public sealed class GetSprintsQueryHandler : IRequestHandler<GetSprintsQuery, IReadOnlyList<SprintDto>>
{
    private readonly IWorkboardDbContext _db;

    public GetSprintsQueryHandler(IWorkboardDbContext db) => _db = db;

    public Task<IReadOnlyList<SprintDto>> Handle(GetSprintsQuery request, CancellationToken cancellationToken)
    {
        var stories = _db.Stories.ToList();
        IReadOnlyList<SprintDto> result = _db.Sprints.OrderByDescending(item => item.StartDate).ToList()
            .Select(sprint => SprintProjection.Create(sprint, stories)).ToList();
        return Task.FromResult(result);
    }
}

