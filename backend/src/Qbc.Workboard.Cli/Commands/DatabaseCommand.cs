using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands;

public sealed class DatabaseCommand
{
    public DatabaseCommand(InitializeDatabaseCommand initializeCommand, ResetDatabaseCommand resetCommand, QueryDatabaseCommand queryCommand)
    {
        Command = new Command("database", "Initialize, reset, or query a QBC Workboard database.");
        Command.Subcommands.Add(initializeCommand.Command);
        Command.Subcommands.Add(resetCommand.Command);
        Command.Subcommands.Add(queryCommand.Command);
    }

    public Command Command { get; }
}
