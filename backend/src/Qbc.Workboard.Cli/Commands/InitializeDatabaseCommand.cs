using Microsoft.Extensions.DependencyInjection;
using Qbc.Workboard.Cli.Console;
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
        Command = new Command("initialize", "Create the local database and apply all migrations without deleting existing data.");
        Command.Options.Add(seedOption);
        Command.SetAction(async (parseResult, cancellationToken) =>
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var maintenance = scope.ServiceProvider.GetRequiredService<IDatabaseMaintenanceService>();
            var seed = parseResult.GetValue(seedOption);
            await maintenance.InitializeAsync(seed, cancellationToken);
            console.WriteLine(seed ? "Database initialized with representative data." : "Database initialized in a clean state.");
            return 0;
        });
    }

    public Command Command { get; }
}
