using System.Net;
using System.Net.Http.Json;
using System.Reflection;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class DeploymentVersionAcceptanceTests : IDisposable
{
    private readonly WorkboardApiFactory _factory = new();

    [Fact]
    public async Task L2_044_Read_the_running_build_without_a_credential()
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
    public async Task L2_044_Report_the_build_that_is_actually_deployed()
    {
        var client = _factory.CreateClient();

        var version = await client.GetFromJsonAsync<DeploymentVersionDto>("/api/version");

        Assert.NotNull(version);
        var hostMetadata = typeof(Api.Program).Assembly
            .GetCustomAttributes<AssemblyMetadataAttribute>()
            .ToDictionary(attribute => attribute.Key, attribute => attribute.Value);
        Assert.Equal(hostMetadata["QbcBuildVersion"], version.Version);
        Assert.Equal(hostMetadata.GetValueOrDefault("QbcSourceRevision"), version.Commit);
    }

    public void Dispose()
    {
        _factory.Dispose();
        GC.SuppressFinalize(this);
    }
}
