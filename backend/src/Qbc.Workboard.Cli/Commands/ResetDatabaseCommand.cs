using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Options;
using Qbc.Workboard.Cli.Services;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands;

public sealed class ResetDatabaseCommand
{
    public ResetDatabaseCommand(IServiceScopeFactory scopeFactory, IOptions<DatabaseResetOptions> options, IConsoleWriter console)
    {
        var forceOption = new Option<bool>("--force")
        {
            Description = "Confirm permanent deletion of the current local database."
        };
        var seedOption = new Option<bool>("--seed")
        {
            Description = "Add representative development data after the reset."
        };
        Command = new Command("reset", "Delete the local database and recreate a fully migrated database.");
        Command.Options.Add(forceOption);
        Command.Options.Add(seedOption);
        Command.SetAction(async (parseResult, cancellationToken) =>
        {
            var force = parseResult.GetValue(forceOption);
            if (options.Value.RequireForce && !force)
            {
                console.WriteError("Database reset was not performed. Pass --force to confirm permanent data deletion.");
                return 1;
            }

            await using var scope = scopeFactory.CreateAsyncScope();
            var maintenance = scope.ServiceProvider.GetRequiredService<IDatabaseMaintenanceService>();
            var seed = parseResult.GetValue(seedOption);
            await maintenance.ResetAsync(seed, cancellationToken);
            console.WriteLine(seed ? "Database reset and initialized with representative data." : "Database reset to a clean initialized state.");
            return 0;
        });
    }

    public Command Command { get; }
}
