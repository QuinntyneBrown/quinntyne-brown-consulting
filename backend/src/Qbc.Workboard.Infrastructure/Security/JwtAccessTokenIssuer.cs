using System.Security.Claims;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Qbc.Workboard.Application.Common.Security;

namespace Qbc.Workboard.Infrastructure.Security;

public sealed class JwtAccessTokenIssuer : IAccessTokenIssuer
{
    public const string Issuer = "qbc-workboard";
    public const string Audience = "qbc-workboard";

    private readonly WorkspaceAccessOptions _options;
    private readonly TimeProvider _timeProvider;

    public JwtAccessTokenIssuer(IOptions<WorkspaceAccessOptions> options, TimeProvider timeProvider)
    {
        _options = options.Value;
        _timeProvider = timeProvider;
    }

    public AccessToken Issue(string signingKey)
    {
        var issuedAt = _timeProvider.GetUtcNow();
        var expiresAt = issuedAt.AddDays(_options.TokenLifetimeDays);
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = Issuer,
            Audience = Audience,
            IssuedAt = issuedAt.UtcDateTime,
            NotBefore = issuedAt.UtcDateTime,
            Expires = expiresAt.UtcDateTime,
            Subject = new ClaimsIdentity([new Claim(JwtRegisteredClaimNames.Sub, "workspace")]),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Convert.FromBase64String(signingKey)),
                SecurityAlgorithms.HmacSha256)
        };

        return new AccessToken(new JsonWebTokenHandler().CreateToken(descriptor), expiresAt);
    }
}
