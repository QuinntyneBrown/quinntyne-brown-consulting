using Microsoft.Extensions.Configuration;

namespace Qbc.Workboard.Infrastructure.Persistence;

internal sealed class ConfigurationWorkboardConnectionStringProvider : IWorkboardConnectionStringProvider
{
    private readonly IConfiguration _configuration;

    public ConfigurationWorkboardConnectionStringProvider(IConfiguration configuration) =>
        _configuration = configuration;

    public string GetConnectionString() =>
        _configuration.GetConnectionString("Workboard")
        ?? throw new InvalidOperationException("Connection string 'Workboard' is required.");
}
