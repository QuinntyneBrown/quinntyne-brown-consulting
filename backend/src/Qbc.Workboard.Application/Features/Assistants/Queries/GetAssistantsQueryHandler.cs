using MediatR;

namespace Qbc.Workboard.Application.Features.Assistants.Queries;

public sealed class GetAssistantsQueryHandler : IRequestHandler<GetAssistantsQuery, IReadOnlyList<AssistantDto>>
{
    private readonly IWorkboardDbContext _db;

    public GetAssistantsQueryHandler(IWorkboardDbContext db) => _db = db;

    public Task<IReadOnlyList<AssistantDto>> Handle(GetAssistantsQuery request, CancellationToken cancellationToken)
    {
        var stories = _db.Stories.ToList();
        var tasks = _db.StoryTasks.ToList();
        IReadOnlyList<AssistantDto> result = _db.Assistants.OrderBy(item => item.FullName).ToList()
            .Select(assistant => AssistantProjection.Create(assistant, stories, tasks)).ToList();
        return Task.FromResult(result);
    }
}

