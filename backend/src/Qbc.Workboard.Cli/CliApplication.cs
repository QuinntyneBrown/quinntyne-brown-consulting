using Qbc.Workboard.Cli.Commands;
using System.CommandLine;
using System.CommandLine.Invocation;

namespace Qbc.Workboard.Cli;

public sealed class CliApplication
{
    private readonly RootCommand _rootCommand;

    public CliApplication(DatabaseCommand databaseCommand)
    {
        _rootCommand = new RootCommand("Maintain local and deployed QBC Workboard databases.");
        _rootCommand.Subcommands.Add(databaseCommand.Command);
    }

    public Task<int> InvokeAsync(string[] arguments, CancellationToken cancellationToken = default) =>
        _rootCommand.Parse(arguments).InvokeAsync(new InvocationConfiguration(), cancellationToken);
}
