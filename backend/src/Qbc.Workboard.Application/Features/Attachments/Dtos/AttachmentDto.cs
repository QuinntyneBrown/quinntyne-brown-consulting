using Qbc.Workboard.Domain.Enums;

namespace Qbc.Workboard.Application.Features.Attachments.Dtos;

public sealed record AttachmentDto(
    Guid Id,
    WorkItemKind WorkItemKind,
    Guid WorkItemId,
    string FileName,
    string ContentType,
    long SizeInBytes,
    Guid? UploadedByAssistantId,
    string? UploadedBy,
    DateTimeOffset UploadedOn);
