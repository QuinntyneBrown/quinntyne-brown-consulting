using Microsoft.Data.SqlClient;

namespace Qbc.Workboard.Api.IntegrationTests.Support;

internal static class SqlServerTestDatabase
{
    private const string ConnectionStringVariable = "QBC_TEST_SQLSERVER_CONNECTION_STRING";
    private const string LocalConnectionString =
        "Server=.\\SQLEXPRESS;Trusted_Connection=True;TrustServerCertificate=True";

    public static string CreateConnectionString(string databasePrefix)
    {
        var connectionString = Environment.GetEnvironmentVariable(ConnectionStringVariable)
            ?? LocalConnectionString;
        var builder = new SqlConnectionStringBuilder(connectionString)
        {
            InitialCatalog = $"{databasePrefix}{Guid.NewGuid():N}"
        };

        return builder.ConnectionString;
    }
}
