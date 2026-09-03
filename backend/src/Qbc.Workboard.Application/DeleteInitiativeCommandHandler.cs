using MediatR;

namespace Qbc.Workboard.Application;

public sealed class DeleteInitiativeCommandHandler : IRequestHandler<DeleteInitiativeCommand>
{
    private readonly IWorkboardDbContext _db;

    public DeleteInitiativeCommandHandler(IWorkboardDbContext db)
    {
        _db = db;
    }

    public async Task Handle(DeleteInitiativeCommand request, CancellationToken cancellationToken)
    {
        var initiative = _db.Initiatives.SingleOrDefault(item => item.Id == request.Id)
            ?? throw new NotFoundException("Initiative", request.Id);
        if (_db.Epics.Any(epic => epic.InitiativeId == request.Id))
        {
            throw new ConflictException("Delete or move the initiative's epics before deleting it.");
        }

        _db.Remove(initiative);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

