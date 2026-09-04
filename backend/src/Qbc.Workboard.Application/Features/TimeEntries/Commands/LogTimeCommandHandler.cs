using MediatR;

namespace Qbc.Workboard.Application.Features.TimeEntries.Commands;

public sealed class LogTimeCommandHandler : IRequestHandler<LogTimeCommand, TimeEntryDto>
{
    private readonly IWorkboardDbContext _db;

    public LogTimeCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<TimeEntryDto> Handle(LogTimeCommand request, CancellationToken cancellationToken)
    {
        if (!_db.Stories.Any(item => item.Id == request.StoryId)) throw new NotFoundException("Story", request.StoryId);
        if (!_db.Assistants.Any(item => item.Id == request.AssistantId)) throw new NotFoundException("Assistant", request.AssistantId);

        // Validation refuses a missing date, so the request carries one by the time it reaches here.
        var entry = new TimeEntry(
            Guid.NewGuid(),
            request.StoryId,
            request.AssistantId,
            request.WorkedOn!.Value,
            request.Hours,
            request.Note);
        _db.Add(entry);
        await _db.SaveChangesAsync(cancellationToken);
        return TimeEntryProjection.Create(entry, _db.Stories.ToList(), _db.Assistants.ToList());
    }
}
