namespace Qbc.Workboard.Cli.Services;

public interface IDatabaseQueryService
{
    Task<DatabaseQueryResult> QueryAsync(string sql, CancellationToken cancellationToken);
}

/// <summary>The first result set a query produced: column names and each row's values as text.</summary>
public sealed record DatabaseQueryResult(IReadOnlyList<string> Columns, IReadOnlyList<IReadOnlyList<string>> Rows);
