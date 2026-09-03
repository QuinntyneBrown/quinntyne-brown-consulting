using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Qbc.Workboard.Application.Common.Persistence;
using Qbc.Workboard.Infrastructure.Security;

namespace Qbc.Workboard.Api.Security;

/// <summary>
/// Supplies the bearer validation parameters from the signing key stored beside the
/// passcode. Options are configured once, on the first authenticated request, which is
/// always after the startup initializer has created the workspace access row.
/// </summary>
public sealed class ConfigureJwtBearerOptions : IConfigureNamedOptions<JwtBearerOptions>
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ConfigureJwtBearerOptions(IServiceScopeFactory scopeFactory) => _scopeFactory = scopeFactory;

    public void Configure(JwtBearerOptions options) => Configure(JwtBearerDefaults.AuthenticationScheme, options);

    public void Configure(string? name, JwtBearerOptions options)
    {
        if (name != JwtBearerDefaults.AuthenticationScheme)
        {
            return;
        }

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IWorkboardDbContext>();
        var access = db.WorkspaceAccess.SingleOrDefault()
            ?? throw new InvalidOperationException(
                "The workspace access record is missing. Initialize the database before serving requests.");

        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = JwtAccessTokenIssuer.Issuer,
            ValidateAudience = true,
            ValidAudience = JwtAccessTokenIssuer.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Convert.FromBase64String(access.SigningKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };

        // The default challenge writes an empty body. Every other failure on this API is
        // Problem Details, so a locked workspace answers the same way.
        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                var problemDetails = context.HttpContext.RequestServices
                    .GetRequiredService<IProblemDetailsService>();
                await problemDetails.TryWriteAsync(new ProblemDetailsContext
                {
                    HttpContext = context.HttpContext,
                    ProblemDetails = new ProblemDetails
                    {
                        Status = StatusCodes.Status401Unauthorized,
                        Type = "urn:qbc-workboard:problem:unauthorized",
                        Title = "Workspace is locked",
                        Detail = "Unlock the workspace with the passcode to use this resource."
                    }
                });
            }
        };
    }
}
