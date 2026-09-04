using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Qbc.Workboard.Api.Controllers;

/// <summary>
/// Reports which build is serving the workspace. It sits outside the passcode gate, because it
/// carries no workspace data and because confirming a deployment—from the passcode screen or
/// from a shell—must not require the shared passcode.
/// </summary>
[ApiController]
[Route("api/version")]
[AllowAnonymous]
public sealed class VersionController : ControllerBase
{
    private readonly ISender _sender;

    public VersionController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    [ProducesResponseType<DeploymentVersionDto>(StatusCodes.Status200OK)]
    public async Task<ActionResult<DeploymentVersionDto>> Get(CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(new GetDeploymentVersionQuery(), cancellationToken));
    }
}
