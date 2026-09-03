using MediatR;

namespace Qbc.Workboard.Application.Features.Sprints.Commands;

public sealed class CompleteSprintCommandHandler : IRequestHandler<CompleteSprintCommand, SprintDto>
{
    private readonly IWorkboardDbContext _db;

    public CompleteSprintCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<SprintDto> Handle(CompleteSprintCommand request, CancellationToken cancellationToken)
    {
        var sprint = _db.Sprints.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Sprint", request.Id);
        sprint.Complete();
        var members = _db.Stories.Where(item => item.SprintId == sprint.Id).ToList();
        foreach (var story in members.Where(item => item.BoardStatus != BoardStatus.Done)) story.ReturnToBacklog();
        await _db.SaveChangesAsync(cancellationToken);
        return SprintProjection.Create(sprint, _db.Stories.ToList());
    }
}

