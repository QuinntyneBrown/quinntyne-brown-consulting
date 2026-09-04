using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Qbc.Workboard.Api.Controllers;

[ApiController]
[Route("api/assistants")]
public sealed class AssistantsController : ControllerBase
{
    private readonly ISender _sender;

    public AssistantsController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AssistantDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetAssistantsQuery(), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AssistantDto>> Get(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetAssistantQuery(id), cancellationToken));

    [HttpGet("{id:guid}/hours")]
    public async Task<ActionResult<AssistantHoursDto>> GetHours(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetAssistantHoursQuery(id), cancellationToken));

    [HttpPost]
    public async Task<ActionResult<AssistantDto>> Create(AssistantRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new SaveAssistantCommand(null, request.FullName, request.Role, request.Specialties, request.Availability), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AssistantDto>> Update(Guid id, AssistantRequest request, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new SaveAssistantCommand(id, request.FullName, request.Role, request.Specialties, request.Availability), cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteAssistantCommand(id), cancellationToken);
        return NoContent();
    }
}
