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
            Description = "Confirm permanent deletion of data in the selected database."
        };
        var seedOption = new Option<bool>("--seed")
        {
            Description = "Add representative development data after the reset."
        };
        var targetOption = DatabaseTargetOption.Create();
        var confirmDatabaseOption = new Option<string?>("--confirm-database")
        {
            Description = "For Azure resets, repeat the exact database name as an additional destructive-operation guard."
        };
        Command = new Command("reset", "Remove all data from the selected database and recreate its fully migrated schema.");
        Command.Options.Add(forceOption);
        Command.Options.Add(seedOption);
        Command.Options.Add(targetOption);
        Command.Options.Add(confirmDatabaseOption);
        Command.SetAction(async (parseResult, cancellationToken) =>
        {
            var target = parseResult.GetValue(targetOption);
            var force = parseResult.GetValue(forceOption);
            if ((target == DatabaseTarget.Azure || options.Value.RequireForce) && !force)
            {
                console.WriteError("Database reset was not performed. Pass --force to confirm permanent data deletion.");
                return 1;
            }

            await using var scope = scopeFactory.CreateAsyncScope();
            var connection = scope.ServiceProvider.GetRequiredService<DatabaseTargetConnectionStringProvider>();
            try
            {
                connection.Select(target);
            }
            catch (InvalidOperationException exception)
            {
                console.WriteError(exception.Message);
                return 1;
            }

            var confirmation = parseResult.GetValue(confirmDatabaseOption);
            if (target == DatabaseTarget.Azure && !string.Equals(confirmation, connection.Database, StringComparison.Ordinal))
            {
                console.WriteError(
                    $"Azure database reset was not performed. Pass --confirm-database {connection.Database} with the exact database name.");
                return 1;
            }

            console.WriteLine($"Target: {target.ToString().ToLowerInvariant()} database '{connection.Database}' on '{connection.Server}'.");
            var maintenance = scope.ServiceProvider.GetRequiredService<IDatabaseMaintenanceService>();
            var seed = parseResult.GetValue(seedOption);
            await maintenance.ResetAsync(target, seed, cancellationToken);
            console.WriteLine(seed
                ? $"{target} database reset and initialized with representative data."
                : $"{target} database reset to a clean initialized state.");
            return 0;
        });
    }

    public Command Command { get; }
}
