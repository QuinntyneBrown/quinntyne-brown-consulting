using MediatR;
using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed class DeleteStoryCommandHandler : IRequestHandler<DeleteStoryCommand>
{
    private readonly IWorkboardDbContext _db;

    public DeleteStoryCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task Handle(DeleteStoryCommand request, CancellationToken cancellationToken)
    {
        var story = _db.Stories.SingleOrDefault(item => item.Id == request.Id) ?? throw new NotFoundException("Story", request.Id);
        if (story.SprintId is not null && _db.Sprints.Any(item => item.Id == story.SprintId && item.Status == SprintStatus.Completed))
            throw new ConflictException("Completed sprint history cannot be deleted.");
        _db.Remove(story);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

