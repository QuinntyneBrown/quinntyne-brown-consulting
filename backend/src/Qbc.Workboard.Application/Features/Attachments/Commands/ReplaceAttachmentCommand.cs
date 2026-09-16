using MediatR;

namespace Qbc.Workboard.Application.Features.Attachments.Commands;

public sealed record ReplaceAttachmentCommand(Guid Id, string FileName, string ContentType,
    byte[] Content, int? ExpectedRevision) : IRequest<AttachmentDto>, IValidatableRequest
{
    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>(new UploadAttachmentCommand(
            WorkItemKind.Story, Id, FileName, ContentType, Content, null).Validate());
        if (ExpectedRevision is null or < 0)
            errors["expectedRevision"] = ["A non-negative expected revision is required."];
        return errors;
    }
}
