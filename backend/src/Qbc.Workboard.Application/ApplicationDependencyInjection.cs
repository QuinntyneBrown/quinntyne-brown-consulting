using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Qbc.Workboard.Application;

public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(configuration => configuration.RegisterServicesFromAssembly(typeof(ApplicationDependencyInjection).Assembly));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddSingleton<StoryReadinessPolicy>();
        return services;
    }
}
