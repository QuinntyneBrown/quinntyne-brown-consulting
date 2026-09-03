using Microsoft.Extensions.Hosting;

namespace Qbc.Workboard.Cli.IntegrationTests.Support;

public sealed class CliTestHost : IAsyncDisposable
{
    private readonly IHost _host;

    private CliTestHost(IHost host, TestConsoleWriter console)
    {
        _host = host;
        Console = console;
    }

    public TestConsoleWriter Console { get; }

    public static CliTestHost Create(bool requireForce = true)
    {
        var connectionString =
            $"Server=.\\SQLEXPRESS;Database=QbcWorkboardCliTests{Guid.NewGuid():N};Trusted_Connection=True;TrustServerCertificate=True";
        var console = new TestConsoleWriter();
        var host = new CliHostBuilder().Build(builder =>
        {
            builder.Configuration["ConnectionStrings:Workboard"] = connectionString;
            builder.Configuration["DatabaseReset:RequireForce"] = requireForce.ToString();
            builder.Services.AddSingleton<IConsoleWriter>(console);
        });
        return new CliTestHost(host, console);
    }

    public Task<int> InvokeAsync(params string[] arguments) =>
        _host.Services.GetRequiredService<CliApplication>().InvokeAsync(arguments);

    public async Task AddInitiativeAsync(Guid id, string name)
    {
        await using var scope = _host.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<WorkboardDbContext>();
        await db.Database.MigrateAsync();
        db.Add(new Initiative(id, name, "Test initiative"));
        await db.SaveChangesAsync();
    }

    public async Task<(int Initiatives, int Epics, int Stories, int StoryTasks, int Assistants, int Sprints, int StoryKeySequences, bool IsCurrent)> ReadStateAsync()
    {
        await using var scope = _host.Services.CreateAsyncScope();
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

    public async Task<bool> InitiativeExistsAsync(Guid id)
    {
        await using var scope = _host.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<WorkboardDbContext>();
        return await db.Initiatives.AnyAsync(item => item.Id == id);
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            await using var scope = _host.Services.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<WorkboardDbContext>();
            if (await db.Database.CanConnectAsync())
            {
                await db.Database.EnsureDeletedAsync();
            }
        }
        finally
        {
            _host.Dispose();
        }
    }
}
