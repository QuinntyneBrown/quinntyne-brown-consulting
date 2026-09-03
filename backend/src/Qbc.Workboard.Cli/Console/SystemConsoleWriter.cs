namespace Qbc.Workboard.Cli.Console;

public sealed class SystemConsoleWriter : IConsoleWriter
{
    public void WriteLine(string message) => System.Console.WriteLine(message);

    public void WriteError(string message) => System.Console.Error.WriteLine(message);
}
