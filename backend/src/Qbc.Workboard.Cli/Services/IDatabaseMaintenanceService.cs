using Qbc.Workboard.Cli.Options;

namespace Qbc.Workboard.Cli.Services;

public interface IDatabaseMaintenanceService
{
    Task InitializeAsync(bool seed, CancellationToken cancellationToken);
    Task ResetAsync(DatabaseTarget target, bool seed, CancellationToken cancellationToken);
}
