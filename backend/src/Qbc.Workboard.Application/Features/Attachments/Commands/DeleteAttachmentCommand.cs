using MediatR;

namespace Qbc.Workboard.Application.Features.Attachments.Commands;

public sealed record DeleteAttachmentCommand(Guid Id) : IRequest;
