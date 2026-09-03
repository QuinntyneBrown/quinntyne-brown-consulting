using Microsoft.Extensions.Hosting;
using Qbc.Workboard.Infrastructure;

namespace Qbc.Workboard.Cli;

public sealed class CliHostBuilder
{
    public IHost Build(Action<HostApplicationBuilder>? configure = null)
    {
        var builder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings
        {
            Args = [],
            ContentRootPath = AppContext.BaseDirectory
        });
        configure?.Invoke(builder);
        builder.Services.AddInfrastructure(builder.Configuration);
        builder.Services.AddCli();
        return builder.Build();
    }
}
