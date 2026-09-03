using MediatR;
using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed class SaveSprintCommandHandler : IRequestHandler<SaveSprintCommand, SprintDto>
{
    private readonly IWorkboardDbContext _db;

    public SaveSprintCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<SprintDto> Handle(SaveSprintCommand request, CancellationToken cancellationToken)
    {
        var normalized = request.Name.Trim().ToLowerInvariant();
        if (_db.Sprints.Any(item => item.Id != request.Id && item.Name.ToLower() == normalized))
            throw new RequestValidationException(new Dictionary<string, string[]> { ["name"] = ["Sprint name must be unique."] });

        Sprint sprint;
        if (request.Id is null)
        {
            sprint = new Sprint(Guid.NewGuid(), request.Name, request.Goal, request.StartDate);
            _db.Add(sprint);
        }
        else
        {
            sprint = _db.Sprints.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Sprint", request.Id);
            if (sprint.Status == SprintStatus.Completed && sprint.StartDate != request.StartDate)
                throw new ConflictException("Completed sprint dates cannot be changed.");
            sprint.Update(request.Name, request.Goal, request.StartDate);
        }

        await _db.SaveChangesAsync(cancellationToken);
        return SprintProjection.Create(sprint, _db.Stories.ToList());
    }
}

