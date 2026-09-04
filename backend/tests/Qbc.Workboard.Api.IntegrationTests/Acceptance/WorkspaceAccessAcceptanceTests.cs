using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class WorkspaceAccessAcceptanceTests : IDisposable
{
    private readonly WorkboardApiFactory _factory = new();

    [Fact]
    public async Task L2_041_Open_the_workspace_with_the_passcode()
    {
        using var client = _factory.CreateClient();

        var unlock = await client.PostAsJsonAsync(
            "/api/access/unlock",
            new UnlockRequest(WorkboardApiFactory.SeededPasscode));

        Assert.Equal(HttpStatusCode.OK, unlock.StatusCode);
        var token = await unlock.Content.ReadFromJsonAsync<AccessTokenDto>();
        Assert.NotNull(token);
        Assert.False(string.IsNullOrWhiteSpace(token.Token));
        // The credential says when it stops working.
        Assert.True(token.ExpiresAtUtc > DateTimeOffset.UtcNow);

        // And it authorizes the work-management resources it was issued for.
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.Token);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/workspace?route=board")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/stories/backlog")).StatusCode);
        Assert.Equal(
            HttpStatusCode.Created,
            (await client.PostAsJsonAsync("/api/initiatives", new InitiativeRequest("An outcome", "A description."))).StatusCode);
    }

    [Fact]
    public async Task L2_041_Refuse_an_incorrect_passcode()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/access/unlock", new UnlockRequest("1111"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("urn:qbc-workboard:problem:unauthorized", problem.GetProperty("type").GetString());
        var detail = problem.GetProperty("detail").GetString();
        Assert.False(string.IsNullOrWhiteSpace(detail));
        // The refusal gives nothing away about the passcode it was checked against.
        Assert.DoesNotContain(WorkboardApiFactory.SeededPasscode, problem.GetRawText(), StringComparison.Ordinal);
        Assert.DoesNotContain("hash", problem.GetRawText(), StringComparison.OrdinalIgnoreCase);

        // A passcode of the wrong shape is a validation failure, and says nothing more either.
        var malformed = await client.PostAsJsonAsync("/api/access/unlock", new UnlockRequest("abc"));
        Assert.Equal(HttpStatusCode.BadRequest, malformed.StatusCode);
        var invalid = await malformed.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(invalid.GetProperty("errors").TryGetProperty("passcode", out _));
        Assert.DoesNotContain(WorkboardApiFactory.SeededPasscode, invalid.GetRawText(), StringComparison.Ordinal);
    }

    [Fact]
    public async Task L2_041_Refuse_an_unaccompanied_request()
    {
        using var unlocked = _factory.CreateUnlockedClient();
        var initiative = await new Workspace(unlocked).AddInitiativeAsync();
        using var client = _factory.CreateClient();

        foreach (var route in new[] { "/api/workspace?route=board", "/api/stories/backlog", "/api/initiatives", "/api/sprints", "/api/assistants" })
        {
            var response = await client.GetAsync(route);

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal("urn:qbc-workboard:problem:unauthorized", problem.GetProperty("type").GetString());
        }

        // An expired or otherwise unusable credential is no better than none.
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "not-a-workspace-token");
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/stories/backlog")).StatusCode);

        // Nothing was read or changed on the way through: the workspace is as the unlocked client left it.
        var deletion = await client.DeleteAsync($"/api/initiatives/{initiative.Id}");
        Assert.Equal(HttpStatusCode.Unauthorized, deletion.StatusCode);
        Assert.Single((await new Workspace(unlocked).ReadHierarchyAsync()).Initiatives);
    }

    public void Dispose()
    {
        _factory.Dispose();
        GC.SuppressFinalize(this);
    }
}
