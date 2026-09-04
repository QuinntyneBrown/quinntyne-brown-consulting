namespace Qbc.Workboard.Domain.Entities;

/// <summary>
/// The bytes of one attachment, kept in their own record so that listing a work item's files never
/// reads them. Storage is the workspace database: the deployment has one durable store, and
/// `L1-008` requires the record to outlive the process holding it.
/// </summary>
public sealed class AttachmentContent
{
    private AttachmentContent()
    {
    }

    public AttachmentContent(Guid attachmentId, byte[] bytes)
    {
        AttachmentId = attachmentId;
        Bytes = bytes;
    }

    public Guid AttachmentId { get; private set; }
    public byte[] Bytes { get; private set; } = [];
}
