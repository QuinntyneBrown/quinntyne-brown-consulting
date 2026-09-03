using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Qbc.Workboard.Api.Controllers;

[ApiController]
[Route("api/epics")]
public sealed class EpicsController : ControllerBase
{
    private readonly ISender _sender;

    public EpicsController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EpicDto>>> GetAll([FromQuery] Guid? initiativeId, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetEpicsQuery(initiativeId), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EpicDto>> Get(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetEpicQuery(id), cancellationToken));

    [HttpPost]
    public async Task<ActionResult<EpicDto>> Create(EpicRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new SaveEpicCommand(null, request.InitiativeId, request.Name, request.Summary), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EpicDto>> Update(Guid id, EpicRequest request, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new SaveEpicCommand(id, request.InitiativeId, request.Name, request.Summary), cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteEpicCommand(id), cancellationToken);
        return NoContent();
    }
}
