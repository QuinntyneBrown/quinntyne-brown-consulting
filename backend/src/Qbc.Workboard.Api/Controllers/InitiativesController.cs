using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Qbc.Workboard.Api.Controllers;

[ApiController]
[Route("api/initiatives")]
public sealed class InitiativesController : ControllerBase
{
    private readonly ISender _sender;

    public InitiativesController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InitiativeDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetInitiativesQuery(), cancellationToken));

    [HttpGet("hierarchy")]
    public async Task<ActionResult<HierarchyDto>> GetHierarchy(CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetHierarchyQuery(), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InitiativeDto>> Get(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetInitiativeQuery(id), cancellationToken));

    [HttpPost]
    public async Task<ActionResult<InitiativeDto>> Create(InitiativeRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new SaveInitiativeCommand(null, request.Name, request.Description), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<InitiativeDto>> Update(Guid id, InitiativeRequest request, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new SaveInitiativeCommand(id, request.Name, request.Description), cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteInitiativeCommand(id), cancellationToken);
        return NoContent();
    }
}

