using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Commands;

public sealed class SaveEpicCommandHandler : IRequestHandler<SaveEpicCommand, EpicDto>
{
    private readonly IWorkboardDbContext _db;

    public SaveEpicCommandHandler(IWorkboardDbContext db)
    {
        _db = db;
    }

    public async Task<EpicDto> Handle(SaveEpicCommand request, CancellationToken cancellationToken)
    {
        if (!_db.Initiatives.Any(item => item.Id == request.InitiativeId))
        {
            throw new NotFoundException("Initiative", request.InitiativeId);
        }

        Epic epic;
        if (request.Id is null)
        {
            epic = new Epic(Guid.NewGuid(), request.InitiativeId, request.Name, request.Summary);
            _db.Add(epic);
        }
        else
        {
            epic = _db.Epics.SingleOrDefault(item => item.Id == request.Id)
                ?? throw new NotFoundException("Epic", request.Id);
            epic.Update(request.InitiativeId, request.Name, request.Summary);
        }

        await _db.SaveChangesAsync(cancellationToken);
        return new EpicDto(epic.Id, epic.InitiativeId, epic.Name, epic.Summary);
    }
}

