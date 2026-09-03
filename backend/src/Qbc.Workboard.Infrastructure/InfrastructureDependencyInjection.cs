using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Qbc.Workboard.Infrastructure;

public static class InfrastructureDependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.TryAddScoped<IWorkboardConnectionStringProvider, ConfigurationWorkboardConnectionStringProvider>();
        services.AddDbContext<WorkboardDbContext>((provider, options) =>
            options.UseSqlServer(
                provider.GetRequiredService<IWorkboardConnectionStringProvider>().GetConnectionString(),
                sqlOptions => sqlOptions.EnableRetryOnFailure()));
        services.Configure<WorkboardDatabaseOptions>(options =>
        {
            options.SeedDevelopmentData = bool.TryParse(configuration["SeedDevelopmentData"], out var seed) && seed;
        });
        services.AddScoped<IWorkboardDbContext>(provider => provider.GetRequiredService<WorkboardDbContext>());
        services.AddScoped<WorkboardDbInitializer>();
        return services;
    }
}
