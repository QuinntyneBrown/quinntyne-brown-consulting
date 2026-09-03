namespace Qbc.Workboard.Application.Common.Security;

public sealed record AccessToken(string Token, DateTimeOffset ExpiresAtUtc);
