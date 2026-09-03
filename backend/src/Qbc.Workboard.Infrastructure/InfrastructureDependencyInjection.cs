using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Qbc.Workboard.Application.Common.Security;
using Qbc.Workboard.Infrastructure.Security;

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
        services.Configure<WorkspaceAccessOptions>(options =>
        {
            var passcode = configuration["Access:InitialPasscode"];
            if (!string.IsNullOrWhiteSpace(passcode))
            {
                options.InitialPasscode = passcode;
            }

            if (int.TryParse(configuration["Access:TokenLifetimeDays"], out var days) && days > 0)
            {
                options.TokenLifetimeDays = days;
            }
        });
        services.TryAddSingleton(TimeProvider.System);
        services.AddSingleton<IPasscodeHasher, Pbkdf2PasscodeHasher>();
        services.AddSingleton<IAccessTokenIssuer, JwtAccessTokenIssuer>();
        services.AddScoped<IWorkboardDbContext>(provider => provider.GetRequiredService<WorkboardDbContext>());
        services.AddScoped<WorkboardDbInitializer>();
        return services;
    }
}
