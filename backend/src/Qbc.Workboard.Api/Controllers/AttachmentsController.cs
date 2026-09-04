using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Qbc.Workboard.Api.Controllers;

[ApiController]
[Route("api/attachments")]
public sealed class AttachmentsController : ControllerBase
{
    /// <summary>
    /// The transport ceiling, deliberately above the per-file limit. A file a little over the limit
    /// reaches the handler and is refused by name; only a body far past any plausible attachment is
    /// cut off by the transport, where no Problem Details can be written.
    /// </summary>
    private const long MaximumRequestBytes = 32L * 1024 * 1024;

    private readonly ISender _sender;

    public AttachmentsController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AttachmentDto>>> Get(
        [FromQuery] WorkItemKind workItemKind,
        [FromQuery] Guid workItemId,
        CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetAttachmentsQuery(workItemKind, workItemId), cancellationToken));

    [HttpPost]
    [RequestSizeLimit(MaximumRequestBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaximumRequestBytes)]
    public async Task<ActionResult<AttachmentDto>> Upload(
        [FromForm] IFormFile? file,
        [FromForm] WorkItemKind workItemKind,
        [FromForm] Guid workItemId,
        [FromForm] Guid? uploadedByAssistantId,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new UploadAttachmentCommand(
                workItemKind,
                workItemId,
                file?.FileName ?? string.Empty,
                file?.ContentType ?? string.Empty,
                await ReadAsync(file, cancellationToken),
                uploadedByAssistantId),
            cancellationToken);

        return Created($"/api/attachments/{result.Id}/content", result);
    }

    [HttpGet("{id:guid}/content")]
    public async Task<IActionResult> GetContent(Guid id, CancellationToken cancellationToken)
    {
        var content = await _sender.Send(new GetAttachmentContentQuery(id), cancellationToken);
        // Naming the file sets a download disposition, so an uploaded document is never rendered as
        // a page of the workspace's own origin.
        return File(content.Bytes, content.ContentType, content.FileName);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteAttachmentCommand(id), cancellationToken);
        return NoContent();
    }

    private static async Task<byte[]> ReadAsync(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null) return [];

        using var buffer = new MemoryStream();
        await file.CopyToAsync(buffer, cancellationToken);
        return buffer.ToArray();
    }
}
