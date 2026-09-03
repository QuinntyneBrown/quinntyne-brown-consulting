using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Queries;

public sealed class GetStoryQueryHandler : IRequestHandler<GetStoryQuery, StoryDto>
{
    private readonly IWorkboardDbContext _db;

    public GetStoryQueryHandler(IWorkboardDbContext db) => _db = db;

    public Task<StoryDto> Handle(GetStoryQuery request, CancellationToken cancellationToken)
    {
        var story = _db.Stories.SingleOrDefault(item => item.Id == request.Id)
            ?? throw new NotFoundException("Story", request.Id);
        return Task.FromResult(StoryProjection.Create(
            story,
            _db.Epics.ToList(),
            _db.Initiatives.ToList(),
            _db.Assistants.ToList(),
            _db.Sprints.ToList(),
            _db.StoryTasks.ToList()));
    }
}

