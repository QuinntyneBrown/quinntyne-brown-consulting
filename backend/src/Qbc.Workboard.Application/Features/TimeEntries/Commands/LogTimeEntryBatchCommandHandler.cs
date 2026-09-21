using MediatR;

namespace Qbc.Workboard.Application.Features.TimeEntries.Commands;

public sealed class LogTimeEntryBatchCommandHandler : IRequestHandler<LogTimeEntryBatchCommand, IReadOnlyList<TimeEntryDto>>
{
    private readonly IWorkboardDbContext _db;

    public LogTimeEntryBatchCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<IReadOnlyList<TimeEntryDto>> Handle(LogTimeEntryBatchCommand request, CancellationToken cancellationToken)
    {
        // Every story is checked before anything is added, so an unknown one leaves the group unrecorded.
        var known = _db.Stories.Where(item => request.StoryIds.Contains(item.Id)).Select(item => item.Id).ToHashSet();
        foreach (var storyId in request.StoryIds)
        {
            if (!known.Contains(storyId)) throw new NotFoundException("Story", storyId);
        }

        if (!_db.Assistants.Any(item => item.Id == request.AssistantId)) throw new NotFoundException("Assistant", request.AssistantId);

        // Validation refuses a missing date, so the request carries one by the time it reaches here.
        var shares = HoursSplitter.Split(request.TotalHours, request.StoryIds.Count);
        var entries = request.StoryIds
            .Select((storyId, index) => new TimeEntry(Guid.NewGuid(), storyId, request.AssistantId, request.WorkedOn!.Value, shares[index], request.Note))
            .ToList();
        foreach (var entry in entries) _db.Add(entry);

        // One save, so the group is persisted together or not at all.
        await _db.SaveChangesAsync(cancellationToken);
        var stories = _db.Stories.ToList();
        var assistants = _db.Assistants.ToList();
        return entries.Select(entry => TimeEntryProjection.Create(entry, stories, assistants)).ToList();
    }
}
