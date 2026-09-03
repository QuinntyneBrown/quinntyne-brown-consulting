using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Commands;

public sealed class SaveInitiativeCommandHandler : IRequestHandler<SaveInitiativeCommand, InitiativeDto>
{
    private readonly IWorkboardDbContext _db;

    public SaveInitiativeCommandHandler(IWorkboardDbContext db)
    {
        _db = db;
    }

    public async Task<InitiativeDto> Handle(SaveInitiativeCommand request, CancellationToken cancellationToken)
    {
        Initiative initiative;
        if (request.Id is null)
        {
            initiative = new Initiative(Guid.NewGuid(), request.Name, request.Description);
            _db.Add(initiative);
        }
        else
        {
            initiative = _db.Initiatives.SingleOrDefault(item => item.Id == request.Id)
                ?? throw new NotFoundException("Initiative", request.Id);
            initiative.Update(request.Name, request.Description);
        }

        await _db.SaveChangesAsync(cancellationToken);
        return new InitiativeDto(initiative.Id, initiative.Name, initiative.Description);
    }
}

