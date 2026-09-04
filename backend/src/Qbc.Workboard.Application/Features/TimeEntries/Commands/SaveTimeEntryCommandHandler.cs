using MediatR;

namespace Qbc.Workboard.Application.Features.TimeEntries.Commands;

public sealed class SaveTimeEntryCommandHandler : IRequestHandler<SaveTimeEntryCommand, TimeEntryDto>
{
    private readonly IWorkboardDbContext _db;

    public SaveTimeEntryCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<TimeEntryDto> Handle(SaveTimeEntryCommand request, CancellationToken cancellationToken)
    {
        if (!_db.Stories.Any(item => item.Id == request.StoryId)) throw new NotFoundException("Story", request.StoryId);
        if (!_db.Assistants.Any(item => item.Id == request.AssistantId)) throw new NotFoundException("Assistant", request.AssistantId);

        // Validation refuses a missing date, so the request carries one by the time it reaches here.
        TimeEntry entry;
        if (request.Id is null)
        {
            entry = new TimeEntry(
                Guid.NewGuid(),
                request.StoryId,
                request.AssistantId,
                request.WorkedOn!.Value,
                request.Hours,
                request.Note);
            _db.Add(entry);
        }
        else
        {
            entry = _db.TimeEntries.SingleOrDefault(item => item.Id == request.Id)
                ?? throw new NotFoundException("Time entry", request.Id);
            entry.Update(request.StoryId, request.AssistantId, request.WorkedOn!.Value, request.Hours, request.Note);
        }

        await _db.SaveChangesAsync(cancellationToken);
        return TimeEntryProjection.Create(entry, _db.Stories.ToList(), _db.Assistants.ToList());
    }
}
