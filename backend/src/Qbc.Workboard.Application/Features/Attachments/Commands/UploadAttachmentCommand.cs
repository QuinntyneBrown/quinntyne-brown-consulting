using MediatR;

namespace Qbc.Workboard.Application.Features.Attachments.Commands;

public sealed record UploadAttachmentCommand(
    WorkItemKind WorkItemKind,
    Guid WorkItemId,
    string FileName,
    string ContentType,
    byte[] Content,
    Guid? UploadedByAssistantId) : IRequest<AttachmentDto>, IValidatableRequest
{
    /// <summary>The published per-file limit, which the dropzone states and the API enforces.</summary>
    public const long MaximumBytes = 25L * 1024 * 1024;

    /// <summary>
    /// Programs are refused by extension. A wider service would decide on the sniffed type as well,
    /// since an extension is only a claim, but the claim is the part a person acts on.
    /// </summary>
    private static readonly string[] BlockedExtensions =
        ["exe", "bat", "cmd", "com", "msi", "scr", "sh", "ps1", "dll", "jar"];

    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        var name = FileName.Trim();

        if (name.Length == 0)
        {
            errors["file"] = ["A file is required."];
        }
        else if (Content.LongLength == 0)
        {
            errors["file"] = ["The file is empty, or is a folder. Folders have to be zipped first."];
        }
        else if (Content.LongLength > MaximumBytes)
        {
            errors["file"] = ["The file is over the 25 MB limit."];
        }
        else if (BlockedExtensions.Contains(ExtensionOf(name)))
        {
            errors["file"] = ["Programs and scripts cannot be attached."];
        }

        if (WorkItemId == Guid.Empty)
        {
            errors["workItemId"] = ["A work item is required."];
        }

        return errors;
    }

    private static string ExtensionOf(string name)
    {
        var dot = name.LastIndexOf('.');
        return dot > 0 ? name[(dot + 1)..].ToLowerInvariant() : string.Empty;
    }
}
