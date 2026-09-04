namespace Qbc.Workboard.Application.Features.Attachments.Projections;

public static class AttachmentProjection
{
    public static AttachmentDto Create(Attachment attachment, IReadOnlyList<Assistant> assistants)
    {
        // The uploader is optional and the assistant may since have been deleted, so the name is
        // looked up rather than assumed, and the file reads as unattributed when there is none.
        var uploader = attachment.UploadedByAssistantId is { } id
            ? assistants.SingleOrDefault(item => item.Id == id)
            : null;

        return new AttachmentDto(
            attachment.Id,
            attachment.Kind,
            attachment.WorkItemId,
            attachment.FileName,
            attachment.ContentType,
            attachment.SizeInBytes,
            uploader?.Id,
            uploader?.FullName,
            attachment.UploadedOn);
    }
}
