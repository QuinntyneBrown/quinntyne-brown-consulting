using Microsoft.EntityFrameworkCore;

namespace Qbc.Workboard.Infrastructure.Persistence;

/// <summary>
/// Applies the recorded migrations, which is how a deployed database reaches the current schema
/// without losing the data already in it.
/// </summary>
public sealed class MigrationWorkboardSchemaInitializer : IWorkboardSchemaInitializer
{
    private readonly WorkboardDbContext _db;

    public MigrationWorkboardSchemaInitializer(WorkboardDbContext db) => _db = db;

    public Task EnsureSchemaAsync(CancellationToken cancellationToken = default) =>
        _db.Database.MigrateAsync(cancellationToken);
}
