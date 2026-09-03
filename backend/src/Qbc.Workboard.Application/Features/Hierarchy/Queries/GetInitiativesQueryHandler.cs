using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Queries;

public sealed class GetInitiativesQueryHandler : IRequestHandler<GetInitiativesQuery, IReadOnlyList<InitiativeDto>>
{
    private readonly IWorkboardDbContext _db;

    public GetInitiativesQueryHandler(IWorkboardDbContext db)
    {
        _db = db;
    }

    public Task<IReadOnlyList<InitiativeDto>> Handle(GetInitiativesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<InitiativeDto> result = _db.Initiatives.OrderBy(item => item.Name)
            .Select(item => new InitiativeDto(item.Id, item.Name, item.Description)).ToList();
        return Task.FromResult(result);
    }
}

