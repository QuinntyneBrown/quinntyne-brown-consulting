using MediatR;
using Qbc.Workboard.Application.Common.Security;

namespace Qbc.Workboard.Application.Features.Access.Commands;

public sealed class UnlockWorkspaceCommandHandler : IRequestHandler<UnlockWorkspaceCommand, AccessTokenDto>
{
    private const string RejectionMessage = "That passcode is not right.";

    private readonly IWorkboardDbContext _db;
    private readonly IPasscodeHasher _hasher;
    private readonly IAccessTokenIssuer _issuer;

    public UnlockWorkspaceCommandHandler(IWorkboardDbContext db, IPasscodeHasher hasher, IAccessTokenIssuer issuer)
    {
        _db = db;
        _hasher = hasher;
        _issuer = issuer;
    }

    public Task<AccessTokenDto> Handle(UnlockWorkspaceCommand request, CancellationToken cancellationToken)
    {
        var access = _db.WorkspaceAccess.SingleOrDefault()
            ?? throw new UnauthorizedException(RejectionMessage);

        if (!_hasher.Verify(request.Passcode, access.PasscodeHash))
        {
            throw new UnauthorizedException(RejectionMessage);
        }

        var token = _issuer.Issue(access.SigningKey);
        return Task.FromResult(new AccessTokenDto(token.Token, token.ExpiresAtUtc));
    }
}
