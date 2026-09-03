using MediatR;
using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed class StartSprintCommandHandler : IRequestHandler<StartSprintCommand, SprintDto>
{
    private readonly IWorkboardDbContext _db;

    public StartSprintCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<SprintDto> Handle(StartSprintCommand request, CancellationToken cancellationToken)
    {
        var sprint = _db.Sprints.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Sprint", request.Id);
        if (_db.Sprints.Any(item => item.Status == SprintStatus.Active && item.Id != sprint.Id))
            throw new ConflictException("Complete the active sprint before starting another sprint.");
        sprint.Start();
        await _db.SaveChangesAsync(cancellationToken);
        return SprintProjection.Create(sprint, _db.Stories.ToList());
    }
}

