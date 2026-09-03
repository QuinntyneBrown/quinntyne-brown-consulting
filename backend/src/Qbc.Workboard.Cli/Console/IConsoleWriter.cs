namespace Qbc.Workboard.Cli.Console;

public interface IConsoleWriter
{
    void WriteLine(string message);
    void WriteError(string message);
}
