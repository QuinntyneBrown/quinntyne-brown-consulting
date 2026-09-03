using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Qbc.Workboard.Api;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class IntegrityAcceptanceTests : IClassFixture<WorkboardApiFactory>
{
    private readonly HttpClient _client;

    public IntegrityAcceptanceTests(WorkboardApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Validation_and_hierarchy_guards_return_problem_details()
    {
        var invalid = await _client.PostAsJsonAsync("/api/initiatives", new InitiativeRequest("", ""));
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        var problem = await invalid.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.GetProperty("errors").TryGetProperty("name", out _));

        var initiative = await (await _client.PostAsJsonAsync("/api/initiatives", new InitiativeRequest("Protected outcome", "An outcome with work."))).Content.ReadFromJsonAsync<InitiativeDto>();
        Assert.NotNull(initiative);
        await _client.PostAsJsonAsync("/api/epics", new EpicRequest(initiative.Id, "Protected epic", "An epic that prevents parent deletion."));

        var guardedDelete = await _client.DeleteAsync($"/api/initiatives/{initiative.Id}");
        Assert.Equal(HttpStatusCode.Conflict, guardedDelete.StatusCode);
        var conflict = await guardedDelete.Content.ReadFromJsonAsync<Microsoft.AspNetCore.Mvc.ProblemDetails>();
        Assert.Equal("urn:qbc-workboard:problem:conflict", conflict?.Type);
    }
}
