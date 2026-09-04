using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class ApiSurfaceAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_028_Expose_resource_operations()
    {
        // Create, query, update, and the permitted delete, on each documented resource.
        var initiative = await Given.AddInitiativeAsync();
        Assert.Single((await Client.GetFromJsonAsync<IReadOnlyList<InitiativeDto>>("/api/initiatives", Workspace.Json))!);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/initiatives/{initiative.Id}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.OK,
            (await Client.PutAsJsonAsync($"/api/initiatives/{initiative.Id}", new InitiativeRequest("Renamed", "Updated."))).StatusCode);

        var epic = await Given.AddEpicAsync(initiative.Id);
        Assert.Single((await Client.GetFromJsonAsync<IReadOnlyList<EpicDto>>($"/api/epics?initiativeId={initiative.Id}", Workspace.Json))!);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/epics/{epic.Id}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.OK,
            (await Client.PutAsJsonAsync($"/api/epics/{epic.Id}", new EpicRequest(initiative.Id, "Renamed", "Updated."))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync("/api/initiatives/hierarchy")).StatusCode);

        var assistant = await Given.AddAssistantAsync();
        Assert.Single((await Client.GetFromJsonAsync<IReadOnlyList<AssistantDto>>("/api/assistants", Workspace.Json))!);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/assistants/{assistant.Id}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.OK,
            (await Client.PutAsJsonAsync(
                $"/api/assistants/{assistant.Id}",
                new AssistantRequest("Renamed", "Updated", [], Availability.Limited))).StatusCode);

        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/assistants/{assistant.Id}/hours")).StatusCode);

        var story = await Given.AddGroomableStoryAsync(epic.Id);
        Assert.Single((await Client.GetFromJsonAsync<IReadOnlyList<StoryDto>>("/api/stories/backlog", Workspace.Json))!);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/stories/{story.Id}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.OK,
            (await Client.PutAsJsonAsync(
                $"/api/stories/{story.Id}",
                new StoryRequest(epic.Id, story.Title, story.Description, story.AcceptanceCriteria, 3, null, []))).StatusCode);

        var sprint = await Given.AddSprintAsync();
        Assert.Single((await Client.GetFromJsonAsync<IReadOnlyList<SprintDto>>("/api/sprints", Workspace.Json))!);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/sprints/{sprint.Id}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.OK,
            (await Client.PutAsJsonAsync($"/api/sprints/{sprint.Id}", new SprintRequest("Renamed", "Updated.", sprint.StartDate))).StatusCode);

        // Lifecycle changes are their own named actions, not overloaded writes to the record.
        foreach (var action in new[] { "groom", "mark-unready", "archive", "restore" })
        {
            Assert.Equal(
                HttpStatusCode.OK,
                (await Client.PostAsJsonAsync($"/api/stories/{story.Id}/{action}", new { })).StatusCode);
        }

        await Given.GroomAsync(story.Id);
        Assert.Equal(HttpStatusCode.OK, (await Client.PutAsJsonAsync($"/api/sprints/{sprint.Id}/stories/{story.Id}", new { })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Client.PostAsJsonAsync($"/api/sprints/{sprint.Id}/start", new { })).StatusCode);
        Assert.Equal(
            HttpStatusCode.OK,
            (await Client.PostAsJsonAsync($"/api/stories/{story.Id}/move", new MoveStoryRequest(BoardStatus.Done))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync("/api/sprints/active/board")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Client.DeleteAsync($"/api/sprints/{sprint.Id}/stories/{story.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Client.PostAsJsonAsync($"/api/sprints/{sprint.Id}/complete", new { })).StatusCode);

        // Time entries are created, amended, and removed through their own resource.
        var entry = await Given.LogTimeAsync(story.Id, assistant.Id, hours: 2m);
        Assert.Equal(3m, (await Given.AmendTimeAsync(entry.Id, story.Id, assistant.Id, hours: 3m)).Hours);
        Assert.Equal(HttpStatusCode.NoContent, (await Client.DeleteAsync($"/api/time-entries/{entry.Id}")).StatusCode);

        // The permitted deletes, in the order the guards allow them.
        Assert.Equal(HttpStatusCode.NoContent, (await Client.DeleteAsync($"/api/stories/{story.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await Client.DeleteAsync($"/api/assistants/{assistant.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await Client.DeleteAsync($"/api/epics/{epic.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await Client.DeleteAsync($"/api/initiatives/{initiative.Id}")).StatusCode);
    }

    [Fact]
    public async Task L2_028_Publish_an_API_contract()
    {
        using var anonymous = Factory.CreateClient();

        var response = await anonymous.GetAsync("/openapi/v1.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var document = await response.Content.ReadFromJsonAsync<JsonElement>();
        var paths = document.GetProperty("paths");

        // Every documented collection, item, and lifecycle route is described.
        foreach (var route in new[]
                 {
                     "/api/access/unlock",
                     "/api/version",
                     "/api/workspace",
                     "/api/initiatives",
                     "/api/initiatives/hierarchy",
                     "/api/initiatives/{id}",
                     "/api/epics",
                     "/api/epics/{id}",
                     "/api/assistants",
                     "/api/assistants/{id}",
                     "/api/assistants/{id}/hours",
                     "/api/time-entries",
                     "/api/time-entries/{id}",
                     "/api/stories",
                     "/api/stories/backlog",
                     "/api/stories/{id}",
                     "/api/stories/{id}/groom",
                     "/api/stories/{id}/mark-unready",
                     "/api/stories/{id}/archive",
                     "/api/stories/{id}/restore",
                     "/api/stories/{id}/move",
                     "/api/sprints",
                     "/api/sprints/active/board",
                     "/api/sprints/{id}",
                     "/api/sprints/{id}/start",
                     "/api/sprints/{id}/complete",
                     "/api/sprints/{id}/stories/{storyId}"
                 })
        {
            Assert.True(paths.TryGetProperty(route, out _), $"{route} is missing from the API contract.");
        }

        // A route describes the operations it supports, and what each one answers with.
        var stories = paths.GetProperty("/api/stories/{id}");
        foreach (var method in new[] { "get", "put", "delete" })
        {
            Assert.True(stories.TryGetProperty(method, out var operation), $"{method} /api/stories/{{id}} is undescribed.");
            Assert.NotEmpty(operation.GetProperty("responses").EnumerateObject());
        }

        Assert.NotEmpty(paths.GetProperty("/api/stories").GetProperty("post").GetProperty("requestBody").EnumerateObject());
    }
}
