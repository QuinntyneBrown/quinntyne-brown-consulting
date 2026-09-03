using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Queries;

public sealed class GetSprintQueryHandler : IRequestHandler<GetSprintQuery, SprintDto>
{
    private readonly IWorkboardDbContext _db;

    public GetSprintQueryHandler(IWorkboardDbContext db) => _db = db;

    public Task<SprintDto> Handle(GetSprintQuery request, CancellationToken cancellationToken)
    {
        var sprint = _db.Sprints.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Sprint", request.Id);
        return Task.FromResult(SprintProjection.Create(sprint, _db.Stories.ToList()));
    }
}

