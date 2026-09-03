using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Qbc.Workboard.Infrastructure;

public static class InfrastructureDependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Workboard")
            ?? throw new InvalidOperationException("Connection string 'Workboard' is required.");
        services.AddDbContext<WorkboardDbContext>(options => options.UseSqlServer(connectionString));
        services.Configure<WorkboardDatabaseOptions>(options =>
        {
            options.SeedDevelopmentData = bool.TryParse(configuration["SeedDevelopmentData"], out var seed) && seed;
        });
        services.AddScoped<IWorkboardDbContext>(provider => provider.GetRequiredService<WorkboardDbContext>());
        services.AddScoped<WorkboardDbInitializer>();
        return services;
    }
}
