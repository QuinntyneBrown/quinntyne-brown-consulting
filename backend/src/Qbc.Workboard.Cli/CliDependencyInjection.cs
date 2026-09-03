using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Qbc.Workboard.Cli.Commands;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Options;
using Qbc.Workboard.Cli.Services;

namespace Qbc.Workboard.Cli;

public static class CliDependencyInjection
{
    public static IServiceCollection AddCli(this IServiceCollection services)
    {
        services.AddOptions<DatabaseResetOptions>().BindConfiguration("DatabaseReset");
        services.TryAddSingleton<IConsoleWriter, SystemConsoleWriter>();
        services.AddScoped<IDatabaseMaintenanceService, DatabaseMaintenanceService>();
        services.AddSingleton<InitializeDatabaseCommand>();
        services.AddSingleton<ResetDatabaseCommand>();
        services.AddSingleton<DatabaseCommand>();
        services.AddSingleton<CliApplication>();
        return services;
    }
}
