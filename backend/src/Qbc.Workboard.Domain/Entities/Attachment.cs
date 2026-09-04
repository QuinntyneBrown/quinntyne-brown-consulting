using Qbc.Workboard.Domain.Enums;
using Qbc.Workboard.Domain.Exceptions;

namespace Qbc.Workboard.Domain.Entities;

/// <summary>
/// A file held against one work item. The parent is stored as three nullable keys rather than a kind
/// and a loose ID, so the database owns the relationship: exactly one is set, each is a real foreign
/// key, and deleting a work item takes its files with it instead of leaving them unreachable.
/// </summary>
public sealed class Attachment
{
    private Attachment()
    {
    }

    public Attachment(
        Guid id,
        WorkItemKind kind,
        Guid workItemId,
        string fileName,
        string contentType,
        long sizeInBytes,
        Guid? uploadedByAssistantId,
        DateTimeOffset uploadedOn)
    {
        if (workItemId == Guid.Empty) throw new DomainRuleException("An attachment must name the work item it belongs to.");

        var name = fileName.Trim();
        if (name.Length == 0) throw new DomainRuleException("An attachment must have a file name.");
        if (sizeInBytes <= 0) throw new DomainRuleException("An attachment must have content.");

        Id = id;
        InitiativeId = kind == WorkItemKind.Initiative ? workItemId : null;
        EpicId = kind == WorkItemKind.Epic ? workItemId : null;
        StoryId = kind == WorkItemKind.Story ? workItemId : null;
        FileName = name;
        ContentType = contentType.Trim();
        SizeInBytes = sizeInBytes;
        UploadedByAssistantId = uploadedByAssistantId;
        UploadedOn = uploadedOn;
    }

    public Guid Id { get; private set; }
    public Guid? InitiativeId { get; private set; }
    public Guid? EpicId { get; private set; }
    public Guid? StoryId { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public long SizeInBytes { get; private set; }

    /// <summary>
    /// The assistant the file is attributed to, when one was named. `L1-013` establishes no
    /// individual identity, so there is nobody to infer and a file may be held without an uploader.
    /// </summary>
    public Guid? UploadedByAssistantId { get; private set; }

    public DateTimeOffset UploadedOn { get; private set; }

    /// <summary>Read back over the three keys. Expression-bodied, so EF Core does not map it.</summary>
    public WorkItemKind Kind =>
        InitiativeId is not null ? WorkItemKind.Initiative
        : EpicId is not null ? WorkItemKind.Epic
        : WorkItemKind.Story;

    public Guid WorkItemId => InitiativeId ?? EpicId ?? StoryId ?? Guid.Empty;
}
