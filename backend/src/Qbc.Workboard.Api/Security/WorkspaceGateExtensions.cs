using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace Qbc.Workboard.Api.Security;

public static class WorkspaceGateExtensions
{
    public const string UnlockRateLimitPolicy = "workspace-unlock";

    private const int UnlockAttemptsPerWindow = 10;
    private static readonly TimeSpan UnlockWindow = TimeSpan.FromMinutes(15);

    /// <summary>
    /// Registers bearer authentication for the shared workspace passcode and the rate limit
    /// that keeps a four-digit code from being guessed by a script.
    /// </summary>
    public static IServiceCollection AddWorkspaceGate(this IServiceCollection services)
    {
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
        services.AddSingleton<IConfigureOptions<JwtBearerOptions>, ConfigureJwtBearerOptions>();
        services.AddAuthorization();
        services.AddRateLimiter(limiter =>
        {
            limiter.AddPolicy(UnlockRateLimitPolicy, context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = UnlockAttemptsPerWindow,
                        Window = UnlockWindow,
                        QueueLimit = 0
                    }));
            limiter.OnRejected = static async (context, cancellationToken) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                var problemDetails = context.HttpContext.RequestServices.GetRequiredService<IProblemDetailsService>();
                await problemDetails.TryWriteAsync(new ProblemDetailsContext
                {
                    HttpContext = context.HttpContext,
                    ProblemDetails = new ProblemDetails
                    {
                        Status = StatusCodes.Status429TooManyRequests,
                        Type = "urn:qbc-workboard:problem:too-many-attempts",
                        Title = "Too many attempts",
                        Detail = "Too many passcode attempts. Try again later."
                    }
                });
            };
        });

        return services;
    }
}
