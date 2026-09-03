using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Qbc.Workboard.Api.Controllers;

[ApiController]
[Route("api/workspace")]
public sealed class WorkspaceController : ControllerBase
{
    private readonly ISender _sender;

    public WorkspaceController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    [ProducesResponseType<WorkspaceBootstrapDto>(StatusCodes.Status200OK)]
    public async Task<ActionResult<WorkspaceBootstrapDto>> Get([FromQuery] string route = "board", CancellationToken cancellationToken = default)
    {
        return Ok(await _sender.Send(new GetWorkspaceQuery(route), cancellationToken));
    }
}

