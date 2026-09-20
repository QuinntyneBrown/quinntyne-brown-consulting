using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Services;
using System.CommandLine;
using System.Data.Common;

namespace Qbc.Workboard.Cli.Commands;

/// <summary>
/// Runs a read-only SQL query against the selected database and prints the result set. The
/// statement runs inside a transaction that is always rolled back, so a query that modifies
/// data leaves the deployed database untouched.
/// </summary>
public sealed class QueryDatabaseCommand
{
    public QueryDatabaseCommand(IServiceScopeFactory scopeFactory, IConsoleWriter console)
    {
        var sqlArgument = new Argument<string>("sql")
        {
            Description = "The SQL text to execute, e.g. \"SELECT COUNT(*) FROM Story\"."
        };
        var targetOption = DatabaseTargetOption.Create();
        Command = new Command("query", "Run a read-only SQL query against the selected database and print the rows. Changes are rolled back.");
        Command.Arguments.Add(sqlArgument);
        Command.Options.Add(targetOption);
        Command.SetAction(async (parseResult, cancellationToken) =>
        {
            var sql = parseResult.GetValue(sqlArgument);
            if (string.IsNullOrWhiteSpace(sql))
            {
                console.WriteError("Provide the SQL text to execute.");
                return 1;
            }

            await using var scope = scopeFactory.CreateAsyncScope();
            var target = parseResult.GetValue(targetOption);
            var connection = scope.ServiceProvider.GetRequiredService<DatabaseTargetConnectionStringProvider>();
            try
            {
                connection.Select(target);
            }
            catch (InvalidOperationException exception)
            {
                console.WriteError(exception.Message);
                return 1;
            }

            console.WriteLine($"Target: {target.ToString().ToLowerInvariant()} database '{connection.Database}' on '{connection.Server}'.");
            var query = scope.ServiceProvider.GetRequiredService<IDatabaseQueryService>();
            try
            {
                var result = await query.QueryAsync(sql, cancellationToken);
                foreach (var line in DatabaseQueryResultFormatter.Format(result))
                {
                    console.WriteLine(line);
                }

                return 0;
            }
            catch (Exception exception) when (exception is DbException or InvalidOperationException or RetryLimitExceededException)
            {
                console.WriteError(exception.InnerException?.Message ?? exception.Message);
                return 1;
            }
        });
    }

    public Command Command { get; }
}
