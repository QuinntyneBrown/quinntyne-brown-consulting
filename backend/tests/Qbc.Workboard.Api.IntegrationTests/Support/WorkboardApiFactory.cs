using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Qbc.Workboard.Infrastructure.Persistence;

namespace Qbc.Workboard.Api.IntegrationTests.Support;

public sealed class WorkboardApiFactory : WebApplicationFactory<Api.Program>
{
    private readonly string _connectionString =
        $"Server=.\\SQLEXPRESS;Database=QbcWorkboardApiTests{Guid.NewGuid():N};Trusted_Connection=True;TrustServerCertificate=True";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Workboard", _connectionString);
        builder.UseSetting("SeedDevelopmentData", "false");
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            var options = new DbContextOptionsBuilder<WorkboardDbContext>()
                .UseSqlServer(_connectionString)
                .Options;
            using var db = new WorkboardDbContext(options);
            db.Database.EnsureDeleted();
        }

        base.Dispose(disposing);
    }
}
