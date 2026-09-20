using System.Data;
using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Qbc.Workboard.Infrastructure.Persistence;

namespace Qbc.Workboard.Cli.Services;

/// <summary>
/// Executes SQL over the same connection the context uses for the selected target, so the
/// deployed database is reached with the same passwordless credential as every other command.
/// The statement runs in a transaction that is rolled back once the rows are read.
/// </summary>
public sealed class DatabaseQueryService : IDatabaseQueryService
{
    private const string NullText = "NULL";

    private readonly WorkboardDbContext _db;

    public DatabaseQueryService(WorkboardDbContext db) => _db = db;

    public async Task<DatabaseQueryResult> QueryAsync(string sql, CancellationToken cancellationToken)
    {
        var connection = _db.Database.GetDbConnection();
        await _db.Database.OpenConnectionAsync(cancellationToken);
        try
        {
            await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
            try
            {
                await using var command = connection.CreateCommand();
                command.Transaction = transaction;
                command.CommandText = sql;
                command.CommandType = CommandType.Text;
                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                var columns = Enumerable.Range(0, reader.FieldCount).Select(reader.GetName).ToArray();
                var rows = new List<IReadOnlyList<string>>();
                while (await reader.ReadAsync(cancellationToken))
                {
                    var values = new string[reader.FieldCount];
                    for (var index = 0; index < reader.FieldCount; index++)
                    {
                        values[index] = FormatValue(reader.GetValue(index));
                    }

                    rows.Add(values);
                }

                return new DatabaseQueryResult(columns, rows);
            }
            finally
            {
                await transaction.RollbackAsync(cancellationToken);
            }
        }
        finally
        {
            await _db.Database.CloseConnectionAsync();
        }
    }

    private static string FormatValue(object value) => value switch
    {
        null or DBNull => NullText,
        byte[] bytes => $"0x{Convert.ToHexString(bytes)}",
        IFormattable formattable => formattable.ToString(null, CultureInfo.InvariantCulture),
        _ => value.ToString() ?? string.Empty
    };
}
