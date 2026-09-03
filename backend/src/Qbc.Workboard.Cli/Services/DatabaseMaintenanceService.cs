using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Qbc.Workboard.Cli.Options;
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

    public async Task ResetAsync(DatabaseTarget target, bool seed, CancellationToken cancellationToken)
    {
        if (target == DatabaseTarget.Azure)
        {
            var migrator = _db.Database.GetService<IMigrator>();
            await migrator.MigrateAsync(Migration.InitialDatabase, cancellationToken);
        }
        else
        {
            await _db.Database.EnsureDeletedAsync(cancellationToken);
        }

        await _initializer.InitializeAsync(seed, cancellationToken);
    }
}
