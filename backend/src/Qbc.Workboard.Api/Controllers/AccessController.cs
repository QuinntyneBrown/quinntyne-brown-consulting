using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Qbc.Workboard.Api.Controllers;

[ApiController]
[Route("api/access")]
[AllowAnonymous]
public sealed class AccessController : ControllerBase
{
    private readonly ISender _sender;

    public AccessController(ISender sender) => _sender = sender;

    [HttpPost("unlock")]
    [EnableRateLimiting(WorkspaceGateExtensions.UnlockRateLimitPolicy)]
    public async Task<ActionResult<AccessTokenDto>> Unlock(UnlockRequest request, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new UnlockWorkspaceCommand(request.Passcode), cancellationToken));
}
