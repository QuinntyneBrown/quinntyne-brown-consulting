using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class ApiFailureAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_023_Return_validation_details()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();

        var response = await Client.PostAsJsonAsync(
            "/api/stories",
            new StoryRequest(Guid.Empty, "   ", string.Empty, string.Empty, 4, null, [new StoryTaskRequest(null, " ", false, null)]));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        // RFC 9457 Problem Details: a stable type, a title, the status, and a readable detail.
        Assert.Equal("urn:qbc-workboard:problem:validation", problem.GetProperty("type").GetString());
        Assert.Equal("Validation failed", problem.GetProperty("title").GetString());
        Assert.Equal(400, problem.GetProperty("status").GetInt32());
        Assert.False(string.IsNullOrWhiteSpace(problem.GetProperty("detail").GetString()));

        // Field-specific errors are included, one entry per offending field.
        var errors = problem.GetProperty("errors");
        foreach (var field in new[] { "epicId", "title", "points", "tasks" })
        {
            Assert.True(errors.TryGetProperty(field, out var messages), $"{field} was not reported.");
            Assert.NotEmpty(messages.EnumerateArray());
            Assert.All(messages.EnumerateArray(), message => Assert.False(string.IsNullOrWhiteSpace(message.GetString())));
        }

        // A request with nothing wrong with it carries no errors at all.
        Assert.Equal(
            HttpStatusCode.Created,
            (await Client.PostAsJsonAsync(
                "/api/stories",
                new StoryRequest(epic.Id, "A valid story", string.Empty, string.Empty, 5, null, []))).StatusCode);
    }

    [Fact]
    public async Task L2_023_Return_resource_and_conflict_failures()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var missing = Guid.NewGuid();

        var notFound = await ExpectProblemAsync(
            await Client.GetAsync($"/api/stories/{missing}"),
            HttpStatusCode.NotFound,
            "not-found");
        Assert.Equal("Resource not found", notFound.GetProperty("title").GetString());
        Assert.Contains(missing.ToString(), notFound.GetProperty("detail").GetString()!, StringComparison.Ordinal);

        foreach (var route in new[] { $"/api/initiatives/{missing}", $"/api/epics/{missing}", $"/api/sprints/{missing}", $"/api/assistants/{missing}" })
        {
            await ExpectProblemAsync(await Client.GetAsync(route), HttpStatusCode.NotFound, "not-found");
        }

        // A domain transition that conflicts with the current state is a 409, not a 404 or a 400.
        var story = await Given.AddDraftStoryAsync(epic.Id);
        var conflict = await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/stories/{story.Id}/restore", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal("Operation conflicts with current state", conflict.GetProperty("title").GetString());
        Assert.Equal(409, conflict.GetProperty("status").GetInt32());
    }

    [Fact]
    public async Task L2_023_Protect_internal_information()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();

        // An unexpected failure, produced by taking the store away underneath a live application.
        Factory.BreakTheDatabase();
        var response = await Client.GetAsync("/api/stories/backlog");

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("urn:qbc-workboard:problem:unexpected", problem.GetProperty("type").GetString());

        var body = problem.GetRawText();
        foreach (var leak in new[] { "at Qbc.Workboard", "Microsoft.EntityFrameworkCore", "SqliteConnection", "DataSource", "\\\\", ".cs:line" })
        {
            Assert.DoesNotContain(leak, body, StringComparison.OrdinalIgnoreCase);
        }

        Assert.DoesNotContain(epic.Id.ToString(), body, StringComparison.Ordinal);
        Assert.Equal("The request could not be completed.", problem.GetProperty("detail").GetString());
    }
}
