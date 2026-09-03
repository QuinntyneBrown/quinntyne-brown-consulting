using Microsoft.EntityFrameworkCore;
using Qbc.Workboard.Infrastructure.Persistence;

namespace Qbc.Workboard.Cli.Services;

public sealed class DatabaseMaintenanceService : IDatabaseMaintenanceService
{
    private readonly WorkboardDbContext _db;
    private readonly WorkboardDbInitializer _initializer;

    public DatabaseMaintenanceService(WorkboardDbContext db, WorkboardDbInitializer initializer)
    {
        _db = db;
        _initializer = initializer;
    }

    public Task InitializeAsync(bool seed, CancellationToken cancellationToken) =>
        _initializer.InitializeAsync(seed, cancellationToken);

    public async Task ResetAsync(bool seed, CancellationToken cancellationToken)
    {
        await _db.Database.EnsureDeletedAsync(cancellationToken);
        await _initializer.InitializeAsync(seed, cancellationToken);
    }
}
