namespace Qbc.Workboard.Application.Features.Attachments.Dtos;

public sealed record AttachmentContentDto(string FileName, string ContentType, byte[] Bytes);
