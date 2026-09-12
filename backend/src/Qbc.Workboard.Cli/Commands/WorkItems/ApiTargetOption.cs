using Qbc.Workboard.Cli.Options;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

internal static class ApiTargetOption
{
    public static Option<DatabaseTarget> Create() => new("--target")
    {
        Description = "Select the local or deployed Azure Workboard API. The default is local."
    };
}
