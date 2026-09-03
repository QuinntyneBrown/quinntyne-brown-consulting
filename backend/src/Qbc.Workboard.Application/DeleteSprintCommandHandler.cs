using MediatR;
using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed class DeleteSprintCommandHandler : IRequestHandler<DeleteSprintCommand>
{
    private readonly IWorkboardDbContext _db;

    public DeleteSprintCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task Handle(DeleteSprintCommand request, CancellationToken cancellationToken)
    {
        var sprint = _db.Sprints.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Sprint", request.Id);
        if (sprint.Status != SprintStatus.Planned) throw new ConflictException("Only a planned sprint can be deleted.");
        foreach (var story in _db.Stories.Where(item => item.SprintId == sprint.Id).ToList()) story.ReturnToBacklog();
        _db.Remove(sprint);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

