using MediatR;

namespace Qbc.Workboard.Application;

public sealed class GetInitiativeQueryHandler : IRequestHandler<GetInitiativeQuery, InitiativeDto>
{
    private readonly IWorkboardDbContext _db;

    public GetInitiativeQueryHandler(IWorkboardDbContext db)
    {
        _db = db;
    }

    public Task<InitiativeDto> Handle(GetInitiativeQuery request, CancellationToken cancellationToken)
    {
        var item = _db.Initiatives.Where(value => value.Id == request.Id)
            .Select(value => new InitiativeDto(value.Id, value.Name, value.Description)).SingleOrDefault()
            ?? throw new NotFoundException("Initiative", request.Id);
        return Task.FromResult(item);
    }
}

