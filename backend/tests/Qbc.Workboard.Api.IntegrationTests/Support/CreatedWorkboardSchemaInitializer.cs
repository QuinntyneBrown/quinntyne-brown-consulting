using Microsoft.EntityFrameworkCore;
using Qbc.Workboard.Infrastructure.Persistence;

namespace Qbc.Workboard.Api.IntegrationTests.Support;

/// <summary>
/// Creates the schema from the model rather than replaying the deployment's migrations, because the
/// acceptance suite starts from an empty in-process database every time and has nothing to migrate.
/// </summary>
public sealed class CreatedWorkboardSchemaInitializer : IWorkboardSchemaInitializer
{
    private readonly WorkboardDbContext _db;

    public CreatedWorkboardSchemaInitializer(WorkboardDbContext db) => _db = db;

    public Task EnsureSchemaAsync(CancellationToken cancellationToken = default) =>
        _db.Database.EnsureCreatedAsync(cancellationToken);
}
