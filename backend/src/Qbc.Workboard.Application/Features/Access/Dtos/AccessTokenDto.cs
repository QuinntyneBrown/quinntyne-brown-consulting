namespace Qbc.Workboard.Application.Features.Access.Dtos;

public sealed record AccessTokenDto(string Token, DateTimeOffset ExpiresAtUtc);
