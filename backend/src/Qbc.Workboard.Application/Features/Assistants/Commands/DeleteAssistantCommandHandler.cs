using MediatR;

namespace Qbc.Workboard.Application.Features.Assistants.Commands;

public sealed class DeleteAssistantCommandHandler : IRequestHandler<DeleteAssistantCommand>
{
    private readonly IWorkboardDbContext _db;

    public DeleteAssistantCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task Handle(DeleteAssistantCommand request, CancellationToken cancellationToken)
    {
        var assistant = _db.Assistants.SingleOrDefault(item => item.Id == request.Id)
            ?? throw new NotFoundException("Assistant", request.Id);
        var projection = AssistantProjection.Create(assistant, _db.Stories.ToList(), _db.StoryTasks.ToList(), _db.TimeEntries.ToList());
        if (projection.BlockingAssignments.Count > 0)
        {
            throw new ConflictException("Reassign or remove the assistant's work and logged hours before deleting the assistant.", projection.BlockingAssignments);
        }

        _db.Remove(assistant);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

