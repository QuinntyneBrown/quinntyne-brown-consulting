using MediatR;

namespace Qbc.Workboard.Application.Features.Attachments.Commands;

public sealed class UploadAttachmentCommandHandler : IRequestHandler<UploadAttachmentCommand, AttachmentDto>
{
    private const string UnknownContentType = "application/octet-stream";

    private readonly IWorkboardDbContext _db;

    public UploadAttachmentCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<AttachmentDto> Handle(UploadAttachmentCommand request, CancellationToken cancellationToken)
    {
        EnsureWorkItemExists(request.WorkItemKind, request.WorkItemId);

        if (request.UploadedByAssistantId is { } assistantId && !_db.Assistants.Any(item => item.Id == assistantId))
        {
            throw new NotFoundException("Assistant", assistantId);
        }

        var fileName = request.FileName.Trim();
        var lowered = fileName.ToLowerInvariant();

        // The product versions no attachment, so one name is one file on one work item. The list is
        // scoped to this work item, which is what keeps the same name free everywhere else.
        var taken = AttachmentsFor(request.WorkItemKind, request.WorkItemId)
            .Any(item => item.FileName.ToLower() == lowered);

        if (taken)
        {
            throw new ConflictException(
                $"'{fileName}' is already attached to this work item.",
                new { fileName });
        }

        var attachment = new Attachment(
            Guid.NewGuid(),
            request.WorkItemKind,
            request.WorkItemId,
            fileName,
            string.IsNullOrWhiteSpace(request.ContentType) ? UnknownContentType : request.ContentType,
            request.Content.LongLength,
            request.UploadedByAssistantId,
            DateTimeOffset.UtcNow);

        _db.Add(attachment);
        _db.Add(new AttachmentContent(attachment.Id, request.Content));
        await _db.SaveChangesAsync(cancellationToken);

        return AttachmentProjection.Create(attachment, _db.Assistants.ToList());
    }

    private void EnsureWorkItemExists(WorkItemKind kind, Guid workItemId)
    {
        var exists = kind switch
        {
            WorkItemKind.Initiative => _db.Initiatives.Any(item => item.Id == workItemId),
            WorkItemKind.Epic => _db.Epics.Any(item => item.Id == workItemId),
            _ => _db.Stories.Any(item => item.Id == workItemId)
        };

        if (!exists)
        {
            throw new NotFoundException(kind.ToString(), workItemId);
        }
    }

    private IQueryable<Attachment> AttachmentsFor(WorkItemKind kind, Guid workItemId) => kind switch
    {
        WorkItemKind.Initiative => _db.Attachments.Where(item => item.InitiativeId == workItemId),
        WorkItemKind.Epic => _db.Attachments.Where(item => item.EpicId == workItemId),
        _ => _db.Attachments.Where(item => item.StoryId == workItemId)
    };
}
