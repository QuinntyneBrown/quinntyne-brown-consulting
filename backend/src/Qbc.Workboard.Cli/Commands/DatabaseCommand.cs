using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands;

public sealed class DatabaseCommand
{
    public DatabaseCommand(InitializeDatabaseCommand initializeCommand, ResetDatabaseCommand resetCommand)
    {
        Command = new Command("database", "Initialize or reset the local QBC Workboard database.");
        Command.Subcommands.Add(initializeCommand.Command);
        Command.Subcommands.Add(resetCommand.Command);
    }

    public Command Command { get; }
}
