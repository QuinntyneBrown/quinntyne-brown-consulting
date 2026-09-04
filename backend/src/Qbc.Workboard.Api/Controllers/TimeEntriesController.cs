using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Qbc.Workboard.Api.Controllers;

[ApiController]
[Route("api/time-entries")]
public sealed class TimeEntriesController : ControllerBase
{
    private readonly ISender _sender;

    public TimeEntriesController(ISender sender) => _sender = sender;

    [HttpPost]
    public async Task<ActionResult<TimeEntryDto>> Log(TimeEntryRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new SaveTimeEntryCommand(null, request.StoryId, request.AssistantId, request.WorkedOn, request.Hours, request.Note),
            cancellationToken);
        // An entry is read through its assistant, which is the address the new record shows up at.
        return Created($"/api/assistants/{result.AssistantId}/hours", result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TimeEntryDto>> Amend(Guid id, TimeEntryRequest request, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(
            new SaveTimeEntryCommand(id, request.StoryId, request.AssistantId, request.WorkedOn, request.Hours, request.Note),
            cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteTimeEntryCommand(id), cancellationToken);
        return NoContent();
    }
}
