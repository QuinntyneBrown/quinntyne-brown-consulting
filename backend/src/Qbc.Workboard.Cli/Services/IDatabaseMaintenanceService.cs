namespace Qbc.Workboard.Cli.Services;

public interface IDatabaseMaintenanceService
{
    Task InitializeAsync(bool seed, CancellationToken cancellationToken);
    Task ResetAsync(bool seed, CancellationToken cancellationToken);
}
