using Microsoft.Extensions.Hosting;
using Qbc.Workboard.Cli.Options;
using Qbc.Workboard.Cli.Services;

namespace Qbc.Workboard.Cli.IntegrationTests.Support;

public sealed class CliTestHost : IAsyncDisposable
{
    private readonly IHost _host;
    private readonly bool _hasAzureConnection;

    private CliTestHost(IHost host, TestConsoleWriter console, bool hasAzureConnection)
    {
        _host = host;
        Console = console;
        _hasAzureConnection = hasAzureConnection;
    }

    public TestConsoleWriter Console { get; }

    public static CliTestHost Create(bool requireForce = true, bool includeAzureConnection = true)
    {
        var localConnectionString = SqlServerTestDatabase.CreateConnectionString("QbcWorkboardCliLocalTests");
        var azureConnectionString = SqlServerTestDatabase.CreateConnectionString("QbcWorkboardCliAzureTests");
        var console = new TestConsoleWriter();
        var host = new CliHostBuilder().Build(builder =>
        {
            builder.Configuration["ConnectionStrings:Workboard"] = localConnectionString;
            builder.Configuration["ConnectionStrings:WorkboardAzure"] = includeAzureConnection ? azureConnectionString : null;
            builder.Configuration["DatabaseReset:RequireForce"] = requireForce.ToString();
            builder.Services.AddSingleton<IConsoleWriter>(console);
        });
        return new CliTestHost(host, console, includeAzureConnection);
    }

    public Task<int> InvokeAsync(params string[] arguments) =>
        _host.Services.GetRequiredService<CliApplication>().InvokeAsync(arguments);

    public async Task AddInitiativeAsync(Guid id, string name, DatabaseTarget target = DatabaseTarget.Local)
    {
        await using var scope = _host.Services.CreateAsyncScope();
        SelectTarget(scope, target);
        var db = scope.ServiceProvider.GetRequiredService<WorkboardDbContext>();
        await db.Database.MigrateAsync();
        db.Add(new Initiative(id, name, "Test initiative"));
        await db.SaveChangesAsync();
    }

    public async Task<(int Initiatives, int Epics, int Stories, int StoryTasks, int Assistants, int Sprints, int StoryKeySequences, bool IsCurrent)> ReadStateAsync(
        DatabaseTarget target = DatabaseTarget.Local)
    {
        await using var scope = _host.Services.CreateAsyncScope();
        SelectTarget(scope, target);
        var db = scope.ServiceProvider.GetRequiredService<WorkboardDbContext>();
        var canConnect = await db.Database.CanConnectAsync();
        if (!canConnect)
        {
            return (0, 0, 0, 0, 0, 0, 0, false);
        }

        var pendingMigrations = await db.Database.GetPendingMigrationsAsync();
        return (
            await db.Initiatives.CountAsync(),
            await db.Epics.CountAsync(),
            await db.Stories.CountAsync(),
            await db.StoryTasks.CountAsync(),
            await db.Assistants.CountAsync(),
            await db.Sprints.CountAsync(),
            await db.StoryKeySequences.CountAsync(),
            !pendingMigrations.Any());
    }

    public async Task<bool> InitiativeExistsAsync(Guid id, DatabaseTarget target = DatabaseTarget.Local)
    {
        await using var scope = _host.Services.CreateAsyncScope();
        SelectTarget(scope, target);
        var db = scope.ServiceProvider.GetRequiredService<WorkboardDbContext>();
        return await db.Initiatives.AnyAsync(item => item.Id == id);
    }

    public async Task<int> GetDatabaseIdAsync(DatabaseTarget target)
    {
        await using var scope = _host.Services.CreateAsyncScope();
        SelectTarget(scope, target);
        var db = scope.ServiceProvider.GetRequiredService<WorkboardDbContext>();
        await db.Database.OpenConnectionAsync();
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.CommandText = "SELECT DB_ID()";
        return Convert.ToInt32(await command.ExecuteScalarAsync());
    }

    public string GetDatabaseName(DatabaseTarget target)
    {
        using var scope = _host.Services.CreateScope();
        var connection = scope.ServiceProvider.GetRequiredService<DatabaseTargetConnectionStringProvider>();
        connection.Select(target);
        return connection.Database;
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            foreach (var target in _hasAzureConnection
                ? new[] { DatabaseTarget.Local, DatabaseTarget.Azure }
                : new[] { DatabaseTarget.Local })
            {
                await using var scope = _host.Services.CreateAsyncScope();
                SelectTarget(scope, target);
                var db = scope.ServiceProvider.GetRequiredService<WorkboardDbContext>();
                if (await db.Database.CanConnectAsync())
                {
                    await db.Database.EnsureDeletedAsync();
                }
            }
        }
        finally
        {
            _host.Dispose();
        }
    }

    private static void SelectTarget(AsyncServiceScope scope, DatabaseTarget target) =>
        scope.ServiceProvider.GetRequiredService<DatabaseTargetConnectionStringProvider>().Select(target);
}
