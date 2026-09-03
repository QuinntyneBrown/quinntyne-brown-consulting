namespace Qbc.Workboard.Cli.IntegrationTests.Support;

public sealed class TestConsoleWriter : IConsoleWriter
{
    private readonly List<string> _output = [];
    private readonly List<string> _errors = [];

    public IReadOnlyList<string> Output => _output;
    public IReadOnlyList<string> Errors => _errors;

    public void WriteLine(string message) => _output.Add(message);

    public void WriteError(string message) => _errors.Add(message);
}
