using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Qbc.Workboard.Infrastructure.Persistence;

namespace Qbc.Workboard.Api.IntegrationTests.Support;

public sealed class WorkboardApiFactory : WebApplicationFactory<Api.Program>
{
    /// <summary>
    /// The passcode the database initializer seeds when no value is configured. The factory
    /// deliberately leaves the setting unset so the shipped default is what tests exercise.
    /// </summary>
    public const string SeededPasscode = "2846";

    private readonly string _connectionString =
        SqlServerTestDatabase.CreateConnectionString("QbcWorkboardApiTests");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Workboard", _connectionString);
        builder.UseSetting("SeedDevelopmentData", "false");
    }

    /// <summary>
    /// Creates a client that has passed the workspace gate through the real unlock endpoint.
    /// Tokens are never minted directly, so every suite still exercises the controller,
    /// handler, and persistence path that issues them.
    /// </summary>
    public HttpClient CreateUnlockedClient()
    {
        var client = CreateClient();
        var response = client
            .PostAsJsonAsync("/api/access/unlock", new UnlockRequest(SeededPasscode))
            .GetAwaiter()
            .GetResult();
        response.EnsureSuccessStatusCode();

        var token = response.Content.ReadFromJsonAsync<AccessTokenDto>().GetAwaiter().GetResult();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token!.Token);
        return client;
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
