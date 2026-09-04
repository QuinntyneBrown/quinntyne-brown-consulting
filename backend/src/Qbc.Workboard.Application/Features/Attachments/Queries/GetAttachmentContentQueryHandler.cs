using MediatR;

namespace Qbc.Workboard.Application.Features.Attachments.Queries;

/// <summary>The only reader that touches the stored bytes; every other path reads the record alone.</summary>
public sealed class GetAttachmentContentQueryHandler
    : IRequestHandler<GetAttachmentContentQuery, AttachmentContentDto>
{
    private readonly IWorkboardDbContext _db;

    public GetAttachmentContentQueryHandler(IWorkboardDbContext db) => _db = db;

    public Task<AttachmentContentDto> Handle(GetAttachmentContentQuery request, CancellationToken cancellationToken)
    {
        var attachment = _db.Attachments.SingleOrDefault(item => item.Id == request.Id)
            ?? throw new NotFoundException("Attachment", request.Id);

        var content = _db.AttachmentContents.SingleOrDefault(item => item.AttachmentId == request.Id)
            ?? throw new NotFoundException("Attachment content", request.Id);

        return Task.FromResult(new AttachmentContentDto(attachment.FileName, attachment.ContentType, content.Bytes));
    }
}
