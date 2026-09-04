using MediatR;

namespace Qbc.Workboard.Application.Features.Attachments.Queries;

public sealed class GetAttachmentsQueryHandler
    : IRequestHandler<GetAttachmentsQuery, IReadOnlyList<AttachmentDto>>
{
    private readonly IWorkboardDbContext _db;

    public GetAttachmentsQueryHandler(IWorkboardDbContext db) => _db = db;

    public Task<IReadOnlyList<AttachmentDto>> Handle(GetAttachmentsQuery request, CancellationToken cancellationToken)
    {
        // One work item's own files and no other's: the query names a single column, so nothing is
        // inherited from a parent work item or contributed to one.
        var rows = request.WorkItemKind switch
        {
            WorkItemKind.Initiative => _db.Attachments.Where(item => item.InitiativeId == request.WorkItemId),
            WorkItemKind.Epic => _db.Attachments.Where(item => item.EpicId == request.WorkItemId),
            _ => _db.Attachments.Where(item => item.StoryId == request.WorkItemId)
        };

        var assistants = _db.Assistants.ToList();

        // Newest first is ordered once the rows are read rather than in the query: SQLite, which the
        // acceptance suite runs on, cannot order by a DateTimeOffset, and one work item's files are
        // few enough that ordering them here costs nothing.
        IReadOnlyList<AttachmentDto> attachments = rows
            .ToList()
            .OrderByDescending(item => item.UploadedOn)
            .Select(item => AttachmentProjection.Create(item, assistants))
            .ToList();

        return Task.FromResult(attachments);
    }
}
