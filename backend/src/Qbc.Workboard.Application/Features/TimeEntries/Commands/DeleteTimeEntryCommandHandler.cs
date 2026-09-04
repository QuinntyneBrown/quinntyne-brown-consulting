using MediatR;

namespace Qbc.Workboard.Application.Features.TimeEntries.Commands;

public sealed class DeleteTimeEntryCommandHandler : IRequestHandler<DeleteTimeEntryCommand>
{
    private readonly IWorkboardDbContext _db;

    public DeleteTimeEntryCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task Handle(DeleteTimeEntryCommand request, CancellationToken cancellationToken)
    {
        // Removing an entry is unguarded: it corrects the record, and nothing else depends on it.
        var entry = _db.TimeEntries.SingleOrDefault(item => item.Id == request.Id)
            ?? throw new NotFoundException("Time entry", request.Id);
        _db.Remove(entry);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
