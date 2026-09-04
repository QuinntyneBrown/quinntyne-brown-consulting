using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Qbc.Workboard.Infrastructure.Persistence;

namespace Qbc.Workboard.Api.IntegrationTests.Support;

/// <summary>
/// Hosts the real API — controllers, the MediatR pipeline, validation, the workspace gate, and the
/// Problem Details handler — over an isolated in-process database. Nothing here reaches a database
/// server, so the acceptance suite needs no infrastructure of its own, and every test that builds a
/// factory gets a workspace nobody else can see.
/// </summary>
public sealed class WorkboardApiFactory : WebApplicationFactory<Api.Program>
{
    /// <summary>
    /// The passcode the database initializer seeds when no value is configured. The factory
    /// deliberately leaves the setting unset so the shipped default is what tests exercise.
    /// </summary>
    public const string SeededPasscode = "2846";

    private readonly SqliteConnection _connection;

    public WorkboardApiFactory()
        : this(new SqliteConnection("DataSource=:memory:;Foreign Keys=True"))
    {
    }

    private WorkboardApiFactory(SqliteConnection connection)
    {
        _connection = connection;
        _connection.Open();
    }

    /// <summary>
    /// Builds a second host over the same database this factory owns, which is how a test observes
    /// what survives a restart of the application against unchanged storage.
    /// </summary>
    public WorkboardApiFactory Restart()
    {
        var restarted = new WorkboardApiFactory(_connection) { KeepsConnectionOpen = true };
        return restarted;
    }

    /// <summary>Closes the database this factory owns, so the next request fails unexpectedly.</summary>
    public void BreakTheDatabase() => _connection.Close();

    private bool KeepsConnectionOpen { get; init; }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Workboard", "unused-by-the-acceptance-suite");
        builder.UseSetting("SeedDevelopmentData", "false");
        builder.ConfigureTestServices(services =>
        {
            RemoveDeployedDbContext(services);
            services.AddDbContext<WorkboardDbContext>(options => options.UseSqlite(_connection));
            services.Replace(
                ServiceDescriptor.Scoped<IWorkboardSchemaInitializer, CreatedWorkboardSchemaInitializer>());
        });
    }

    /// <summary>
    /// Takes out the deployment's SQL Server registration. `AddDbContext` contributes its provider
    /// through an options configuration as well as the options themselves, and leaving either behind
    /// makes Entity Framework refuse a second provider.
    /// </summary>
    private static void RemoveDeployedDbContext(IServiceCollection services)
    {
        var registrations = services
            .Where(descriptor =>
                descriptor.ServiceType == typeof(WorkboardDbContext)
                || descriptor.ServiceType == typeof(DbContextOptions)
                || descriptor.ServiceType == typeof(DbContextOptions<WorkboardDbContext>)
                || descriptor.ServiceType.Name.StartsWith("IDbContextOptionsConfiguration", StringComparison.Ordinal))
            .ToList();
        foreach (var registration in registrations)
        {
            services.Remove(registration);
        }
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
        base.Dispose(disposing);
        if (disposing && !KeepsConnectionOpen)
        {
            _connection.Dispose();
        }
    }
}
