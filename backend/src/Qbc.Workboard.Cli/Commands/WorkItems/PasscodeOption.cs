using Microsoft.Extensions.Configuration;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

internal static class PasscodeOption
{
    public static Option<string?> Create() => new("--passcode")
    {
        Description = "Workspace unlock passcode. Falls back to the Api:Passcode configuration value " +
            "(e.g. the Api__Passcode environment variable) when omitted."
    };

    public static string? Resolve(string? passcodeOptionValue, IConfiguration configuration) =>
        !string.IsNullOrWhiteSpace(passcodeOptionValue) ? passcodeOptionValue : configuration["Api:Passcode"];
}
