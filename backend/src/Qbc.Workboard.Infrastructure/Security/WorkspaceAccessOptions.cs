namespace Qbc.Workboard.Infrastructure.Security;

public sealed class WorkspaceAccessOptions
{
    public string InitialPasscode { get; set; } = "2846";

    public int TokenLifetimeDays { get; set; } = 7;
}
