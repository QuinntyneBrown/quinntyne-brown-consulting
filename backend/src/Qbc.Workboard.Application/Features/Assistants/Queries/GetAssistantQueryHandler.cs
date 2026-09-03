using MediatR;

namespace Qbc.Workboard.Application.Features.Assistants.Queries;

public sealed class GetAssistantQueryHandler : IRequestHandler<GetAssistantQuery, AssistantDto>
{
    private readonly IWorkboardDbContext _db;

    public GetAssistantQueryHandler(IWorkboardDbContext db) => _db = db;

    public Task<AssistantDto> Handle(GetAssistantQuery request, CancellationToken cancellationToken)
    {
        var assistant = _db.Assistants.SingleOrDefault(item => item.Id == request.Id)
            ?? throw new NotFoundException("Assistant", request.Id);
        return Task.FromResult(AssistantProjection.Create(assistant, _db.Stories.ToList(), _db.StoryTasks.ToList()));
    }
}

