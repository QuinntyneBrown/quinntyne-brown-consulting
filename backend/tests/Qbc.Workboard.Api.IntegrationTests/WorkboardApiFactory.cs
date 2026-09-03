using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;

namespace Qbc.Workboard.Api.IntegrationTests;

public sealed class WorkboardApiFactory : WebApplicationFactory<Api.Program>
{
    private readonly string _databasePath = Path.Combine(Path.GetTempPath(), $"qbc-workboard-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Workboard", $"Data Source={_databasePath}");
        builder.UseSetting("SeedDevelopmentData", "false");
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        SqliteConnection.ClearAllPools();
        if (disposing && File.Exists(_databasePath))
        {
            File.Delete(_databasePath);
        }
    }
}
