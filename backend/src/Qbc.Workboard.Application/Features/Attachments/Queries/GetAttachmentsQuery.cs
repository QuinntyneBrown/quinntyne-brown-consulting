using MediatR;

namespace Qbc.Workboard.Application.Features.Attachments.Queries;

public sealed record GetAttachmentsQuery(WorkItemKind WorkItemKind, Guid WorkItemId)
    : IRequest<IReadOnlyList<AttachmentDto>>;
