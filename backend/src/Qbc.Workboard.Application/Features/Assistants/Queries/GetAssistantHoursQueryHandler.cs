using MediatR;

namespace Qbc.Workboard.Application.Features.Assistants.Queries;

public sealed class GetAssistantHoursQueryHandler : IRequestHandler<GetAssistantHoursQuery, AssistantHoursDto>
{
    private readonly IWorkboardDbContext _db;

    public GetAssistantHoursQueryHandler(IWorkboardDbContext db) => _db = db;

    public Task<AssistantHoursDto> Handle(GetAssistantHoursQuery request, CancellationToken cancellationToken)
    {
        var assistant = _db.Assistants.SingleOrDefault(item => item.Id == request.Id)
            ?? throw new NotFoundException("Assistant", request.Id);
        // Hours are summed over loaded records rather than in the database, because the acceptance
        // suite stores a decimal as text and would sum it as text.
        return Task.FromResult(AssistantHoursProjection.Create(
            assistant,
            _db.TimeEntries.ToList(),
            _db.Stories.ToList(),
            _db.Epics.ToList(),
            _db.Assistants.ToList()));
    }
}
