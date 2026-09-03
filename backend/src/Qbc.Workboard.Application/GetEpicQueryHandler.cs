using MediatR;

namespace Qbc.Workboard.Application;

public sealed class GetEpicQueryHandler : IRequestHandler<GetEpicQuery, EpicDto>
{
    private readonly IWorkboardDbContext _db;

    public GetEpicQueryHandler(IWorkboardDbContext db)
    {
        _db = db;
    }

    public Task<EpicDto> Handle(GetEpicQuery request, CancellationToken cancellationToken)
    {
        var item = _db.Epics.Where(value => value.Id == request.Id)
            .Select(value => new EpicDto(value.Id, value.InitiativeId, value.Name, value.Summary)).SingleOrDefault()
            ?? throw new NotFoundException("Epic", request.Id);
        return Task.FromResult(item);
    }
}

