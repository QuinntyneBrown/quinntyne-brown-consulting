namespace Qbc.Workboard.Infrastructure.Persistence;

/// <summary>
/// Brings the workspace schema up to date. Deployments migrate a SQL Server database; a suite that
/// runs the application against an isolated in-process database creates the schema from the model
/// instead. Everything the initializer does after the schema exists is shared.
/// </summary>
public interface IWorkboardSchemaInitializer
{
    Task EnsureSchemaAsync(CancellationToken cancellationToken = default);
}
