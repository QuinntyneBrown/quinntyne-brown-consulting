using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Qbc.Workboard.Cli.Commands;
using Qbc.Workboard.Cli.Commands.WorkItems;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Options;
using Qbc.Workboard.Cli.Services;
using Qbc.Workboard.Infrastructure.Persistence;

namespace Qbc.Workboard.Cli;

public static class CliDependencyInjection
{
    public static IServiceCollection AddCli(this IServiceCollection services)
    {
        services.AddOptions<DatabaseResetOptions>().BindConfiguration("DatabaseReset");
        services.TryAddSingleton<IConsoleWriter, SystemConsoleWriter>();
        services.AddScoped<DatabaseTargetConnectionStringProvider>();
        services.Replace(ServiceDescriptor.Scoped<IWorkboardConnectionStringProvider>(provider =>
            provider.GetRequiredService<DatabaseTargetConnectionStringProvider>()));
        services.AddScoped<IDatabaseMaintenanceService, DatabaseMaintenanceService>();
        services.AddSingleton<InitializeDatabaseCommand>();
        services.AddSingleton<ResetDatabaseCommand>();
        services.AddSingleton<DatabaseCommand>();
        services.AddHttpClient(nameof(WorkboardApiClient));
        services.AddSingleton<WorkboardApiClientFactory>();
        services.AddSingleton<CreateInitiativeCommand>();
        services.AddSingleton<CreateEpicCommand>();
        services.AddSingleton<CreateStoryCommand>();
        services.AddSingleton<UpdateStoryCommand>();
        services.AddSingleton<AssignSprintCommand>();
        services.AddSingleton<AttachFileCommand>();
        services.AddSingleton<WorkItemCommand>();
        services.AddSingleton<CliApplication>();
        return services;
    }
}
