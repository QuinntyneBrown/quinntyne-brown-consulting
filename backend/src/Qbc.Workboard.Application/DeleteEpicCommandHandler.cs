using MediatR;

namespace Qbc.Workboard.Application;

public sealed class DeleteEpicCommandHandler : IRequestHandler<DeleteEpicCommand>
{
    private readonly IWorkboardDbContext _db;

    public DeleteEpicCommandHandler(IWorkboardDbContext db)
    {
        _db = db;
    }

    public async Task Handle(DeleteEpicCommand request, CancellationToken cancellationToken)
    {
        var epic = _db.Epics.SingleOrDefault(item => item.Id == request.Id)
            ?? throw new NotFoundException("Epic", request.Id);
        if (_db.Stories.Any(story => story.EpicId == request.Id))
        {
            throw new ConflictException("Move or delete the epic's stories before deleting it.");
        }

        _db.Remove(epic);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

