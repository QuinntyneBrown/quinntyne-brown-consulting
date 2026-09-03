using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Qbc.Workboard.Application;

namespace Qbc.Workboard.Infrastructure;

public static class InfrastructureDependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Workboard")
            ?? throw new InvalidOperationException("Connection string 'Workboard' is required.");
        services.AddDbContext<WorkboardDbContext>(options => options.UseSqlite(connectionString));
        services.AddScoped<IWorkboardDbContext>(provider => provider.GetRequiredService<WorkboardDbContext>());
        services.AddScoped<WorkboardDbInitializer>();
        return services;
    }
}

