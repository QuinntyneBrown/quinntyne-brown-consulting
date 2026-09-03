using Qbc.Workboard.Cli.Options;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands;

internal static class DatabaseTargetOption
{
    public static Option<DatabaseTarget> Create() => new("--target")
    {
        Description = "Select the local or deployed Azure database. The default is local."
    };
}
