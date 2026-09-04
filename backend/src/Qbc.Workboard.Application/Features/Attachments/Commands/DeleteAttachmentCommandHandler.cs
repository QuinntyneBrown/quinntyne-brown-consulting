using MediatR;

namespace Qbc.Workboard.Application.Features.Attachments.Commands;

public sealed class DeleteAttachmentCommandHandler : IRequestHandler<DeleteAttachmentCommand>
{
    private readonly IWorkboardDbContext _db;

    public DeleteAttachmentCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task Handle(DeleteAttachmentCommand request, CancellationToken cancellationToken)
    {
        var attachment = _db.Attachments.SingleOrDefault(item => item.Id == request.Id)
            ?? throw new NotFoundException("Attachment", request.Id);

        // The bytes are removed with the record rather than left for the database to sweep, so the
        // storage a removed file was using is released by the same request that removed it.
        var content = _db.AttachmentContents.SingleOrDefault(item => item.AttachmentId == request.Id);
        if (content is not null)
        {
            _db.Remove(content);
        }

        _db.Remove(attachment);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
