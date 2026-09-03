using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Qbc.Workboard.Cli.Options;
using Qbc.Workboard.Infrastructure.Persistence;

namespace Qbc.Workboard.Cli.Services;

public sealed class DatabaseTargetConnectionStringProvider : IWorkboardConnectionStringProvider
{
    private readonly IConfiguration _configuration;
    private string? _selectedConnectionString;

    public DatabaseTargetConnectionStringProvider(IConfiguration configuration) =>
        _configuration = configuration;

    public DatabaseTarget Target { get; private set; } = DatabaseTarget.Local;
    public string Server { get; private set; } = string.Empty;
    public string Database { get; private set; } = string.Empty;

    public void Select(DatabaseTarget target)
    {
        var name = target == DatabaseTarget.Azure ? "WorkboardAzure" : "WorkboardLocal";
        var connectionString = _configuration.GetConnectionString(name);
        if (target == DatabaseTarget.Local)
        {
            connectionString ??= _configuration.GetConnectionString("Workboard");
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                $"Connection string '{name}' is required for the {target.ToString().ToLowerInvariant()} database target.");
        }

        SqlConnectionStringBuilder builder;
        try
        {
            builder = new SqlConnectionStringBuilder(connectionString);
        }
        catch (ArgumentException exception)
        {
            throw new InvalidOperationException(
                $"Connection string '{name}' is not a valid SQL Server connection string.",
                exception);
        }

        if (string.IsNullOrWhiteSpace(builder.DataSource) || string.IsNullOrWhiteSpace(builder.InitialCatalog))
        {
            throw new InvalidOperationException(
                $"Connection string '{name}' must specify both Server and Database (or Initial Catalog).");
        }

        Target = target;
        Server = builder.DataSource;
        Database = builder.InitialCatalog;
        _selectedConnectionString = builder.ConnectionString;
    }

    public string GetConnectionString() =>
        _selectedConnectionString
        ?? throw new InvalidOperationException("A database target must be selected before resolving the database context.");
}
