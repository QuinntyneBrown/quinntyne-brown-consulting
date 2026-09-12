using Microsoft.Extensions.Configuration;
using Qbc.Workboard.Cli.Options;

namespace Qbc.Workboard.Cli.Services;

public sealed class WorkboardApiClientFactory
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public WorkboardApiClientFactory(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public WorkboardApiClient Create(DatabaseTarget target)
    {
        var baseUrl = _configuration[$"Api:{target}"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new InvalidOperationException($"No Api:{target} base URL is configured.");
        }

        var httpClient = _httpClientFactory.CreateClient(nameof(WorkboardApiClient));
        httpClient.BaseAddress = new Uri(baseUrl.EndsWith('/') ? baseUrl : baseUrl + "/");
        return new WorkboardApiClient(httpClient);
    }
}
