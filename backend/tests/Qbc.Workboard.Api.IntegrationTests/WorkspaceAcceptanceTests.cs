using System.Net;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests;

public sealed class WorkspaceAcceptanceTests : IClassFixture<WorkboardApiFactory>
{
    private readonly HttpClient _client;

    public WorkspaceAcceptanceTests(WorkboardApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Board_workspace_route_returns_bootstrap_state()
    {
        var response = await _client.GetAsync("/api/workspace?route=board");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
