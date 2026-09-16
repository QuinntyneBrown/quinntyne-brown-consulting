using Microsoft.Extensions.Configuration;
using Qbc.Workboard.Cli.Services;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

/// <summary>
/// Opens the workspace session a <c>workitem</c> command runs under. A token captured from
/// <c>workitem login --json</c> and configured as <c>Api:AccessToken</c> is reused as it is, so a
/// batch spends one unlock rather than one per command against the workspace's sign-in limit;
/// otherwise the passcode unlocks the workspace as before.
/// </summary>
internal static class ApiSession
{
    /// <summary>
    /// Authenticates <paramref name="client"/> and returns <see langword="null"/>, or returns the
    /// reason no session could be opened without having sent a request.
    /// </summary>
    public static async Task<string?> AuthenticateAsync(
        WorkboardApiClient client,
        IConfiguration configuration,
        string? passcodeOptionValue,
        CancellationToken cancellationToken)
    {
        var accessToken = configuration["Api:AccessToken"];
        if (!string.IsNullOrWhiteSpace(accessToken))
        {
            client.UseAccessToken(accessToken);
            return null;
        }

        var passcode = PasscodeOption.Resolve(passcodeOptionValue, configuration);
        if (string.IsNullOrWhiteSpace(passcode))
        {
            return "No passcode provided. Pass --passcode or set the Api:Passcode configuration value.";
        }

        await client.UnlockAsync(passcode, cancellationToken);
        return null;
    }
}
