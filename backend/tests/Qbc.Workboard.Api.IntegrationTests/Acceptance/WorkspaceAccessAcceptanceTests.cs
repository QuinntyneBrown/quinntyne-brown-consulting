using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class WorkspaceAccessAcceptanceTests : IClassFixture<WorkboardApiFactory>
{
    private readonly WorkboardApiFactory _factory;

    public WorkspaceAccessAcceptanceTests(WorkboardApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Seeded_passcode_issues_a_token_that_opens_the_workspace()
    {
        var client = _factory.CreateClient();

        var unlock = await client.PostAsJsonAsync(
            "/api/access/unlock",
            new UnlockRequest(WorkboardApiFactory.SeededPasscode));

        Assert.Equal(HttpStatusCode.OK, unlock.StatusCode);
        var token = await unlock.Content.ReadFromJsonAsync<AccessTokenDto>();
        Assert.NotNull(token);
        Assert.False(string.IsNullOrWhiteSpace(token.Token));
        Assert.True(token.ExpiresAtUtc > DateTimeOffset.UtcNow);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.Token);
        var workspace = await client.GetAsync("/api/workspace?route=board");

        Assert.Equal(HttpStatusCode.OK, workspace.StatusCode);
    }

    [Fact]
    public async Task Workspace_resources_reject_a_request_without_a_token()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/workspace?route=board");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(
            "urn:qbc-workboard:problem:unauthorized",
            problem.GetProperty("type").GetString());
    }

    [Fact]
    public async Task Wrong_passcode_is_refused_with_problem_details()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/access/unlock", new UnlockRequest("1111"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(
            "urn:qbc-workboard:problem:unauthorized",
            problem.GetProperty("type").GetString());
        Assert.False(string.IsNullOrWhiteSpace(problem.GetProperty("detail").GetString()));
    }

    [Fact]
    public async Task Passcode_that_is_not_four_digits_is_rejected_as_invalid()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/access/unlock", new UnlockRequest("abc"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.GetProperty("errors").TryGetProperty("passcode", out _));
    }
}
