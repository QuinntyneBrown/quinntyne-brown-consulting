using Microsoft.Extensions.DependencyInjection;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Options;
using Qbc.Workboard.Cli.Services;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands;

public sealed class InitializeDatabaseCommand
{
    public InitializeDatabaseCommand(IServiceScopeFactory scopeFactory, IConsoleWriter console)
    {
        var seedOption = new Option<bool>("--seed")
        {
            Description = "Add representative development data when the database is empty."
        };
        var targetOption = DatabaseTargetOption.Create();
        Command = new Command("initialize", "Create the selected database schema and apply all migrations without deleting existing data.");
        Command.Options.Add(seedOption);
        Command.Options.Add(targetOption);
        Command.SetAction(async (parseResult, cancellationToken) =>
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var target = parseResult.GetValue(targetOption);
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

            console.WriteLine($"Target: {target.ToString().ToLowerInvariant()} database '{connection.Database}' on '{connection.Server}'.");
            var maintenance = scope.ServiceProvider.GetRequiredService<IDatabaseMaintenanceService>();
            var seed = parseResult.GetValue(seedOption);
            await maintenance.InitializeAsync(seed, cancellationToken);
            console.WriteLine(seed
                ? $"{target} database initialized with representative data."
                : $"{target} database initialized in a clean state.");
            return 0;
        });
    }

    public Command Command { get; }
}
