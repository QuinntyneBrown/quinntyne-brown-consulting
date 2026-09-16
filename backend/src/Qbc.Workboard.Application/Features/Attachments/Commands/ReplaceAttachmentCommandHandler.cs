using MediatR;

namespace Qbc.Workboard.Application.Features.Attachments.Commands;

public sealed class ReplaceAttachmentCommandHandler(IWorkboardDbContext db) : IRequestHandler<ReplaceAttachmentCommand, AttachmentDto>
{
    public async Task<AttachmentDto> Handle(ReplaceAttachmentCommand request, CancellationToken cancellationToken)
    {
        var attachment = db.Attachments.SingleOrDefault(item => item.Id == request.Id)
            ?? throw new NotFoundException("Attachment", request.Id);
        if (attachment.Revision != request.ExpectedRevision)
            throw new ConflictException("The attachment revision changed. Download and review it before retrying.");
        if (!string.Equals(Path.GetExtension(attachment.FileName), Path.GetExtension(request.FileName.Trim()), StringComparison.OrdinalIgnoreCase))
            throw new RequestValidationException(new Dictionary<string, string[]> {
                ["file"] = ["Replacement must use the original file extension."] });
        var content = db.AttachmentContents.Single(item => item.AttachmentId == request.Id);
        attachment.ReplaceContent(string.IsNullOrWhiteSpace(request.ContentType) ? "application/octet-stream" : request.ContentType, request.Content.LongLength);
        content.Replace(request.Content);
        // EF saves metadata and content together and checks Revision in the UPDATE predicate.
        await db.SaveChangesAsync(cancellationToken);
        return AttachmentProjection.Create(attachment, db.Assistants.ToList());
    }
}
