using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class DeploymentVersionAcceptanceTests : IClassFixture<WorkboardApiFactory>
{
    private readonly WorkboardApiFactory _factory;

    public DeploymentVersionAcceptanceTests(WorkboardApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Version_resource_reports_the_running_build_without_a_session()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/version");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var version = await response.Content.ReadFromJsonAsync<DeploymentVersionDto>();
        Assert.NotNull(version);
        Assert.False(string.IsNullOrWhiteSpace(version.Version));
    }

    /// <summary>
    /// The reported build has to be the hosting application's. Reading the entry assembly
    /// instead would report the test runner here, and some other launcher in production.
    /// </summary>
    [Fact]
    public async Task Version_resource_reports_the_build_of_the_hosting_application()
    {
        var client = _factory.CreateClient();

        var version = await client.GetFromJsonAsync<DeploymentVersionDto>("/api/version");

        Assert.NotNull(version);
        var host = typeof(Api.Program).Assembly.GetName().Version?.ToString(3);
        Assert.NotNull(host);
        Assert.StartsWith(host, version.Version);
    }
}
