using MediatR;

namespace Qbc.Workboard.Application.Features.Attachments.Queries;

public sealed record GetAttachmentContentQuery(Guid Id) : IRequest<AttachmentContentDto>;
