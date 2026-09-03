using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Queries;

public sealed class GetEpicsQueryHandler : IRequestHandler<GetEpicsQuery, IReadOnlyList<EpicDto>>
{
    private readonly IWorkboardDbContext _db;

    public GetEpicsQueryHandler(IWorkboardDbContext db)
    {
        _db = db;
    }

    public Task<IReadOnlyList<EpicDto>> Handle(GetEpicsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Epics;
        if (request.InitiativeId is not null) query = query.Where(item => item.InitiativeId == request.InitiativeId);
        IReadOnlyList<EpicDto> result = query.OrderBy(item => item.Name)
            .Select(item => new EpicDto(item.Id, item.InitiativeId, item.Name, item.Summary)).ToList();
        return Task.FromResult(result);
    }
}

